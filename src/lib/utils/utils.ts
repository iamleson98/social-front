import { goto } from '$app/navigation';
import { page } from '$app/state';
import type { TranFunc } from '$i18n';
import type { FilterConditions, FilterItemValue, FilterOperator } from '$lib/components/common/filter-box';
import type { BadgeProps } from '$lib/components/ui/Badge/types';
import {
	type Address,
	type AddressInput,
	type Money,
	type Mutation,
	type Query,
	type SelectedAttribute,
	type User,
	AttributeInputTypeEnum,
	CountryCode,
	FulfillmentStatus,
	OrderDirection,
	PermissionEnum,
} from '$lib/gql/graphql';
import { OrderStatus, PaymentChargeStatusEnum } from '$lib/gql/graphql';
import { DEFAULT_CHANNEL, SearchParamKey } from './consts';
import { CHANNEL_KEY } from './consts';
import { getCookieByKey } from './cookies';
import { AppRoute } from './routes';
import type { SupportTicketStatus, SupportTicketTag } from './types';
import { type ServerLoadEvent } from '@sveltejs/kit';
import type { AnyVariables, OperationResult } from '@urql/core';
import dayjs from 'dayjs';
import editorJsToHtml from 'editorjs-html';
import { lowerCase, pick, startCase } from 'es-toolkit';
import { toast } from 'svelte-sonner';
import xss from 'xss';

export const editorJsParser = editorJsToHtml();

let _counter = 0;
export const randomID = () => (++_counter).toString(36);

/**
 * @param length default to 10
 * @returns
 */
export function randomString(length: number = 10) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}
	return result;
}

/**
 * @description Parses the raw product description and returns an array of strings.
 * @param description raw product description
 */
export const parseEditorJsString = (description: string | object): string[] => {
	const result: string[] = [];

	if (!description) return result;

	try {
		const jsonData = typeof description === 'string' ? JSON.parse(description) : description;
		const contentBlocks = editorJsParser.parse(jsonData);
		for (const block of contentBlocks) {
			result.push(xss(block));
		}
	} catch (err) {
		console.error(`Failed parsing product description: ${err}`);
	}

	return result;
};

/**
 * this type represents the graphql query params that are used for pagination.
 */
export type PaginationOptions = {
	before?: string | null;
	after?: string | null;
	first?: number | null;
	last?: number | null;
};

/**
 * A helper method that takes any type that have `before`, `after`, `first`, `last` fields and construct a pagination object.
 */
export function constructPaginationParams<T extends PaginationOptions>({
	before,
	after,
	first,
	last,
}: T): PaginationOptions {
	const pagination = {} as PaginationOptions;
	if (before) {
		pagination.before = before;
	} else if (after) {
		pagination.after = after;
	}
	if (first) {
		pagination.first = first;
	} else if (last) {
		pagination.last = last;
	}
	return pagination;
}

export const formatMoney = (currency: string, startAmount: number, endAmount?: number) => {
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	});
	if (endAmount !== undefined) {
		return formatter.formatRange(startAmount, endAmount);
	}
	return formatter.format(startAmount);
};

export const formatSelectedAttributeValue = (attribute: SelectedAttribute) => {
	if (!attribute.attribute.inputType || !attribute.values.length) {
		return '';
	}

	switch (attribute.attribute.inputType) {
		case AttributeInputTypeEnum.Dropdown:
			return attribute.values[0].name;
		case AttributeInputTypeEnum.Boolean:
			return attribute.values[0].boolean ? 'yes' : 'no';
		case AttributeInputTypeEnum.PlainText:
			return attribute.values[0].name;
		case AttributeInputTypeEnum.Multiselect:
			return attribute.values.join(', ');

		default:
			return attribute.values[0].value;
	}
};

export const getPrefersReducedMotion = () => {
	return (
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
};

/**
 * If given `result` has an error, it will show a toast message with the error message.
 * @param result GraphQl query, operation results
 * @param apiErrorKey Some Graphql mutations return errors in result payload (errors field)
 * @param successMessage Optional success toast message. If you provide this argument, you don't have to send success toast yourself
 * @returns `true` if there is an error, `false` otherwise.
 */
export const checkIfGraphqlResultHasError = <T, K extends AnyVariables>(
	result: OperationResult<T, K>,
	apiErrorKey?: keyof Mutation | keyof Query,
	successMessage?: string,
): boolean => {
	if (result.error) {
		toast.error(result.error.message);
		return true;
	}

	if (result.data) {
		const key = apiErrorKey || Object.keys(result.data)[0];

		const errors = (result.data as Record<string, Record<string, unknown>>)?.[key]?.errors;
		if (!errors && apiErrorKey)
			throw new Error('No errors field. You MUST check your GraphQL query.');

		if (errors && Array.isArray(errors) && errors.length > 0) {
			toast.error(errors[0].message);
			return true;
		}
	}

	if (successMessage) toast.success(successMessage);
	return false;
};

export type PredicateFunc<T> = (obj: T) => boolean;

export const recursiveSearch = <T extends { children?: T[] }>(
	arr: T[],
	predicate: PredicateFunc<T>,
): T | null => {
	if (arr.length === 0) return null;

	for (const obj of arr) {
		if (predicate(obj)) return obj;

		if (obj.children) {
			const res = recursiveSearch(obj.children, predicate);
			if (res) {
				return res;
			}
		}
	}

	return null;
};

export const getHrefForVariant = (productSlug: string, variantID: string): string => {
	const pathName = `${AppRoute.PRODUCT_DETAILS(productSlug)}`;
	if (!variantID) {
		return pathName;
	}

	const query = new URLSearchParams({ variant: variantID });
	return `${pathName}?${query.toString()}`;
};

/**
 *  direction === 'asc' ? 'dsc' : 'asc'
 */
export const flipDirection = (direction: OrderDirection): OrderDirection =>
	direction === OrderDirection.Asc ? OrderDirection.Desc : OrderDirection.Asc;

export const NUMBER_REGEX = /^-?\d+(\.\d+)?$/;
export const BOOL_REGEX = /(true|false)/;
/**
 * regex for range like: `<gte,null>`, `<null,lte>` or `<gte,lte>`.
 */
// eslint-disable-next-line no-useless-escape
export const FILTER_COMPARE_RANGE_REGEX = /^<([\w\d.\-:+]+),([\w\d.\-:+]+)>$/;
/**
 * regex for `key-value` pair matching: `{key,value}`
 */
// eslint-disable-next-line no-useless-escape
export const FILTER_KEY_VALUE_PAIR_REGEX = /^\{([\w\d\.-]+)\,([\w\d\.-]+)\}$/;
/**
 * regex for include matching: `[1,2,3]`, `[one,two,3,efrstr=]`
 */
// eslint-disable-next-line no-useless-escape
export const FILTER_ONE_OF_RANGE_REGEX = /^\[(["'\w\d=,\s.]+)]$/;

export const parseBoolean = (expr: string) => {
	return expr.toLowerCase() === 'true';
};

export type SearchParamsType<T> = Record<keyof T, {
	operator: FilterOperator;
	value: FilterItemValue;
}>;

/**
 * parse search query params, and auto performs type casting when the query param value is boolean or number
 */
export const parseUrlSearchParams = <T>(url: URL) => {
	const result = {} as SearchParamsType<T>;

	for (const key of url.searchParams.keys()) {
		if (!key) continue;

		const value = url.searchParams.get(key)?.trim();
		if (value == null) continue;

		if (NUMBER_REGEX.test(value)) {
			result[key as keyof T] = {
				operator: 'eq',
				value: Number(value),
			};
			continue;
		} else if (BOOL_REGEX.test(value.toLowerCase())) {
			result[key as keyof T] = {
				operator: 'eq',
				value: parseBoolean(value),
			};
			continue;
		}

		const rangeMatches = FILTER_COMPARE_RANGE_REGEX.exec(value);
		if (rangeMatches) {
			let gte = rangeMatches[1].trim();
			let lte = rangeMatches[2].trim();
			if (NUMBER_REGEX.test(gte)) gte = Number(gte) as any;
			if (NUMBER_REGEX.test(lte)) lte = Number(lte) as any;

			if (lte && lte !== 'null' && gte && gte !== 'null')
				result[key as keyof T] = {
					operator: 'range',
					value: [gte, lte],
				};
			else if (lte && lte !== 'null')
				result[key as keyof T] = {
					operator: 'lte',
					value: lte,
				};
			else if (gte && gte !== 'null')
				result[key as keyof T] = {
					operator: 'gte',
					value: gte,
				};

			continue;
		};

		const pairMatches = FILTER_KEY_VALUE_PAIR_REGEX.exec(value);
		if (pairMatches) {
			const keyValue = pairMatches[1].trim();
			const value = pairMatches[2].trim();

			result[key as keyof T] = {
				operator: 'eq',
				value: [keyValue, value],
			};
			continue;
		}

		const oneOfMatches = FILTER_ONE_OF_RANGE_REGEX.exec(value);
		if (oneOfMatches) {
			try {
				result[key as keyof T] = {
					operator: 'oneOf',
					value: JSON.parse(value),
				};
			} catch { }
			continue;
		}

		result[key as keyof T] = {
			operator: 'eq',
			value: value
		};
	}

	return result;
}

/** This function converts filter conditions to URL search params. The reversed process of `parseUrlSearchParams`
 * NOTE: only used in client side since it calls `goto` function
 */
export const constructUrlSearchParamsAndNavigate = async <T>(activeFilters: FilterConditions<T>) => {
	const keys = Object.keys(activeFilters);

	const whiteListKeys = [
		...keys,
		SearchParamKey.AFTER,
		SearchParamKey.BEFORE,
		SearchParamKey.FIRST,
		SearchParamKey.LAST,
		SearchParamKey.ORDER_BY_FIELD,
		SearchParamKey.ORDER_DIRECTION,
	];

	const currentSearchParamKeys = [...page.url.searchParams.keys()];
	// delete not used filter fields
	for (const key of currentSearchParamKeys) {
		if (!whiteListKeys.includes(key)) page.url.searchParams.delete(key);
	}

	for (const key of keys) {
		const filterOpt = activeFilters[key as keyof T];
		if (!filterOpt) continue;

		if (filterOpt.operator === 'lte') {
			page.url.searchParams.set(key, `<null,${filterOpt.value}>`);
		} else if (filterOpt.operator === 'gte') {
			page.url.searchParams.set(key, `<${filterOpt.value},null>`);
		} else if (filterOpt.operator === 'oneOf') {
			page.url.searchParams.set(key, JSON.stringify(filterOpt.value));
		} else if (filterOpt.operator === 'range' && Array.isArray(filterOpt.value)) {
			page.url.searchParams.set(key, `<${filterOpt.value[0]},${filterOpt.value[1]}>`);
		} else if (filterOpt.operator === 'eq') {
			/**
			 * There are a few cases for `eq` operator:
			 * 1) equal to a pair of `key-value` record,
			 */
			if (Array.isArray(filterOpt.value)) {
				page.url.searchParams.set(key, `{${filterOpt.value[0]},${filterOpt.value[1]}}`);
			} else {
				// 2) equal to primitives, E.g: slug='hello-world';
				page.url.searchParams.set(key, `${filterOpt.value}`);
			}
		}
	}

	await goto(`${page.url.pathname}?${page.url.searchParams.toString()}`);
};

type ClassArgs = Record<string, boolean> | string;

/** works like clsx for class names */
export const classNames = (...classes: ClassArgs[]): string => {
	let result = '';

	for (let cls of classes) {
		if (typeof cls === 'string') {
			if (cls) result += `${cls} `;
			continue;
		}
		for (const key in cls) {
			if (cls[key]) {
				result += `${key} `;
			}
		}
	}

	return result.trim();
};

/** This class is commonly used for sections */
export const SitenameCommonClassName = 'bg-white border border-gray-200 p-3 rounded-lg space-y-3!';

/**
 * Builds the link for the home page.
 * With respect to current channel
 */
export const buildHomePageLink = (event?: ServerLoadEvent) => {
	let channelSlug = event ? event.cookies.get(CHANNEL_KEY) : getCookieByKey(CHANNEL_KEY);

	if (!channelSlug) {
		channelSlug = DEFAULT_CHANNEL.slug;
	}

	return `/${channelSlug}`;
};

export const buildLinkWithRespectToChannel = (uri: string, event?: ServerLoadEvent) => {
	return `${buildHomePageLink(event)}/${uri}`;
};

/** Checks if given user has all given permission codes */
export const checkUserHasPermissions = (user: User, ...perms: PermissionEnum[]) => {
	if (!perms.length) return true;

	let count = 0;
	for (const perm of user.userPermissions || []) {
		if (perms.includes(perm.code)) count++;
	}

	return count === perms.length;
};

/**
 * Checks if given user has 3 perms: manage settings, manage staff, manage users.
 */
export const userIsShopAdmin = (user: User) => {
	return checkUserHasPermissions(
		user,
		PermissionEnum.ManageSettings,
		PermissionEnum.ManageStaff,
		PermissionEnum.ManageUsers,
	);
};

export function formatCurrency(value: number): string {
	return value.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export const inferRowsPerPage = (paging: PaginationOptions) => {
	if (paging.first) return paging.first;
	if (paging.last) return paging.last;
	return undefined;
};

export type BadgeAttr = Pick<BadgeProps, 'color' | 'variant' | 'text'>;

export const paymentStatusBadgeClass = (status: PaymentChargeStatusEnum): BadgeAttr => {
	const text = startCase(lowerCase(status.replace(/_/, ' ')));
	switch (status) {
		case PaymentChargeStatusEnum.Cancelled:
			return { text, color: 'red', variant: 'filled' };
		case PaymentChargeStatusEnum.FullyCharged:
			return { text, color: 'green', variant: 'filled' };
		case PaymentChargeStatusEnum.FullyRefunded:
			return { text, color: 'blue', variant: 'outline' };
		case PaymentChargeStatusEnum.NotCharged:
			return { text, color: 'yellow', variant: 'filled' };
		case PaymentChargeStatusEnum.PartiallyCharged:
			return { text, color: 'blue', variant: 'filled' };
		case PaymentChargeStatusEnum.PartiallyRefunded:
			return { text, color: 'blue', variant: 'filled' };
		case PaymentChargeStatusEnum.Pending:
			return { text, color: 'blue', variant: 'light' };
		case PaymentChargeStatusEnum.Refused:
			return { text, color: 'blue', variant: 'filled' };
		default:
			return { text, color: 'blue', variant: 'filled' };
	}
};

export const orderStatusBadgeClass = (status: OrderStatus): BadgeAttr => {
	const text = startCase(lowerCase(status.replace(/_/, ' ')));

	switch (status) {
		case OrderStatus.Canceled:
			return { text, color: 'red', variant: 'filled' };
		case OrderStatus.Draft:
			return { text, color: 'gray', variant: 'outline' };
		case OrderStatus.Expired:
			return { text, color: 'blue', variant: 'light' };
		case OrderStatus.Fulfilled:
			return { text, color: 'green', variant: 'filled' };
		case OrderStatus.PartiallyFulfilled:
			return { text, color: 'blue', variant: 'filled' };
		case OrderStatus.PartiallyReturned:
			return { text, color: 'blue', variant: 'filled' };
		case OrderStatus.Returned:
			return { text, color: 'yellow', variant: 'filled' };
		case OrderStatus.Unconfirmed:
			return { text, color: 'gray', variant: 'outline' };
		case OrderStatus.Unfulfilled:
			return { text, color: 'orange', variant: 'light' };
		default:
			return { text, color: 'blue', variant: 'filled' };
	}
};

export const fulfillmentStatusBadgeClass = (status: FulfillmentStatus): BadgeAttr => {
	const text = startCase(lowerCase(status.replace(/_/g, ' ')));
	switch (status) {
		case FulfillmentStatus.Canceled:
			return { text, color: 'red', variant: 'filled' };
		case FulfillmentStatus.Fulfilled:
			return { text, color: 'green', variant: 'filled' };
		case FulfillmentStatus.Returned:
			return { text, color: 'blue', variant: 'light' };
		case FulfillmentStatus.Refunded:
			return { text, color: 'green', variant: 'light' };
		case FulfillmentStatus.RefundedAndReturned:
			return { text, color: 'blue', variant: 'light' };
		case FulfillmentStatus.Replaced:
			return { text, color: 'orange', variant: 'filled' };
		case FulfillmentStatus.WaitingForApproval:
			return { text, color: 'blue', variant: 'light' };
		default:
			return { text, color: 'gray', variant: 'outline' };
	}
};

export const supportTicketTagToBadgeClass = (tag: SupportTicketTag): BadgeAttr => {
	switch (tag) {
		case 'WARRANTY':
			return { text: 'Warranty', color: 'orange', variant: 'filled' };
		case 'CONSULT':
			return { text: 'Consult', color: 'blue', variant: 'filled' };
		default:
			return { text: 'Unknown', color: 'blue', variant: 'filled' };
	}
};

export const supportTicketStatusToBadgeClass = (status: SupportTicketStatus): BadgeAttr => {
	switch (status) {
		case 'PENDING':
			return { text: 'Pending', color: 'blue', variant: 'light' };
		case 'IN_PROGRESS':
			return { text: 'In Progress', color: 'green', variant: 'light' };
		case 'CLOSED':
			return { text: 'Closed', color: 'green', variant: 'filled' };
		default:
			return { text: 'Unknown', color: 'blue', variant: 'filled' };
	}
};

/**
 * both dayjs and Date's instances satisfy this interface
 */
export interface TimeObject {
	valueOf(): number;
}

dayjs() satisfies TimeObject;
new Date() satisfies TimeObject;

/**
 * Compare 2 date values
 * @param day1 Date | dayjs
 * @param day2 - Date | dayjs
 */
export const compareTime = (day1: TimeObject, day2: TimeObject) => {
	const time1 = day1.valueOf();
	const time2 = day2.valueOf();
	if (time1 > time2) return 1;
	if (time1 === time2) return 0;
	return -1;
};

/** from raw byte numbers to human readable values */
export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB'];
	const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
	const formattedSize: string = (bytes / Math.pow(1024, i)).toFixed(2);
	return `${formattedSize} ${sizes[i]}`;
}

/**
	If the given `str` is longer than given len, cut the first len chars, append ... to the end
 */
export const stringSlicer = (str?: string, len: number = 100) => {
	if (len === 0 || !str) return '-';
	if (str.length < len) return str;

	return str.slice(0, len) + '...';
};

export function subtractMoney(init: Money, ...args: Money[]): Money {
	return {
		amount: args.reduce((acc, curr) => acc - curr.amount, init.amount),
		currency: init.currency,
	};
}

export const convertAddressToAddressInput = (addr: Address): AddressInput => {
	return {
		city: addr.city,
		cityArea: addr.cityArea,
		companyName: addr.companyName,
		country: addr.country.code.toUpperCase() as CountryCode,
		countryArea: addr.countryArea,
		firstName: addr.firstName,
		lastName: addr.lastName,
		metadata: addr.metadata.map((item) => pick(item, ['key', 'value'])),
		phone: addr.phone,
		postalCode: addr.postalCode,
		streetAddress1: addr.streetAddress1,
		streetAddress2: addr.streetAddress2,
		skipValidation: false,
	};
};

export const addNoDup = <T extends string | number>(array: T[], ...items: T[]) => {
	for (const item of items) if (!array.includes(item)) array.push(item);

	return array;
};

export const toggleItemNoDup = <T extends string | number>(
	array: T[],
	item: T,
	add: boolean = true,
) => {
	if (add) return array.includes(item) ? array : array.concat(item);

	return array.filter((it) => it !== item);
};
