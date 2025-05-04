import { type SelectedAttribute, type User, AttributeInputTypeEnum, OrderDirection, PermissionEnum } from '$lib/gql/graphql';
import { toastStore } from '$lib/stores/ui/toast';
import type { AnyVariables, OperationResult } from '@urql/core';
import editorJsToHtml from 'editorjs-html';
import { AppRoute } from './routes';
import xss from 'xss';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { CHANNEL_KEY } from './consts';
import { getCookieByKey } from './cookies';
import { DEFAULT_CHANNEL } from './channels';
import { OrderStatus, PaymentChargeStatusEnum } from "$lib/gql/graphql";
import type { SocialColor } from '$lib/components/ui/common';
import type { ButtonVariant } from '$lib/components/ui';


export const editorJsParser = editorJsToHtml();

let _counter = 0;
export const randomID = () => {
	_counter++;
	return _counter.toString(36);
};

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
export const parseProductDescription = (description: string): string[] => {
	const result: string[] = [];

	if (!description) {
		return result;
	}

	try {
		const jsonData = JSON.parse(description);
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
	last
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
		currency
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
 * @returns `true` if there is an error, `false` otherwise.
 */
export const preHandleErrorOnGraphqlResult = <T, K extends AnyVariables>(
	result: OperationResult<T, K>,
	apiErrorKey?: string,
): boolean => {
	if (result.error) {
		toastStore.send({
			message: result.error.message,
			variant: 'error'
		});
		return true
	}

	if (apiErrorKey && result.data) {
		const errors = (result.data as Record<string, Record<string, unknown>>)?.[apiErrorKey]?.errors;
		if (!errors) console.warn('No errors field. You MUST check your GraphQL query.');

		if (errors && Array.isArray(errors) && errors.length > 0) {
			toastStore.send({
				message: errors[0].message,
				variant: 'error'
			});
			return true;
		}
	}

	return false;
};

export type PredicateFunc<T> = (obj: T) => boolean;

export const recursiveSearch = <T extends { children?: T[] }>(
	arr: T[],
	predicate: PredicateFunc<T>
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

export const flipDirection = (direction: OrderDirection): OrderDirection =>
	direction === OrderDirection.Asc ? OrderDirection.Desc : OrderDirection.Asc;

export const numberRegex = /^-?\d+(\.\d+)?$/;

export const parseUrlSearchParams = (url: URL) => {
	const result: Record<string, number | string> = {};

	for (const key of url.searchParams.keys()) {
		const trimKey = key.trim();
		if (!trimKey) continue;

		let value = url.searchParams.get(key);
		if (!value) continue;

		value = value.trim();
		if (value && numberRegex.test(value)) {
			result[trimKey] = Number(value);
		} else {
			result[trimKey] = value;
		}
	}

	return result;
};

export const clamp = (value: number, min: number, max: number): number => {
	return Math.min(Math.max(value, min), max);
}

export const classNames = (classes: Record<string, boolean>): string => {
	let result = '';

	for (const key in classes) {
		if (classes[key]) {
			result += key + ' ';
		}
	}

	return result.trim();
}

/**
 * Builds the link for the home page.
 * With respect to current channel
 */
export const buildHomePageLink = (event?: ServerLoadEvent) => {
	let channelSlug: string | undefined;
	if (event) {
		channelSlug = event.cookies.get(CHANNEL_KEY);
	} else {
		channelSlug = getCookieByKey(CHANNEL_KEY);
	}

	if (!channelSlug) {
		channelSlug = DEFAULT_CHANNEL.slug;
	}

	return `/${channelSlug}`;
};

export const buildLinkWithRespectToChannel = (uri: string, event?: ServerLoadEvent) => {
	return `${buildHomePageLink(event)}/${uri}`;
};


export const userIsShopAdmin = (user: User) => {
	let canManageSettings: boolean = false, canManageStaff: boolean = false, canManageUsers: boolean = false;

	for (const perm of user.userPermissions || []) {
		switch (perm.code) {
			case PermissionEnum.ManageSettings:
				canManageSettings = true;
				break;
			case PermissionEnum.ManageStaff:
				canManageStaff = true;
				break;
			case PermissionEnum.ManageUsers:
				canManageUsers = true;
				break;
		}
	}

	return canManageUsers && canManageSettings && canManageStaff;
};

export function formatCurrency(value: number): string {
	return value.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
};

export const inferRowsPerPage = (paging: PaginationOptions) => {
	if (paging.first) return paging.first;
	if (paging.last) return paging.last;
	return undefined;
};

export type BadgeAttr = {
	color: SocialColor;
	variant: ButtonVariant;
};

export const paymentStatusBadgeClass = (status: PaymentChargeStatusEnum): BadgeAttr => {
	// NOTE: Those badge classes are found on: https://v5.daisyui.com/components/badge/
	switch (status) {
		case PaymentChargeStatusEnum.Cancelled:
			return { color: 'red', variant: 'filled' };
		case PaymentChargeStatusEnum.FullyCharged:
			return { color: 'green', variant: 'filled' };
		case PaymentChargeStatusEnum.FullyRefunded:
			return { color: 'blue', variant: 'outline' };
		case PaymentChargeStatusEnum.NotCharged:
			return { color: 'yellow', variant: 'filled' };
		case PaymentChargeStatusEnum.PartiallyCharged:
			return { color: 'blue', variant: 'filled' };
		case PaymentChargeStatusEnum.PartiallyRefunded:
			return { color: 'blue', variant: 'filled' };
		case PaymentChargeStatusEnum.Pending:
			return { color: 'blue', variant: 'light' };
		case PaymentChargeStatusEnum.Refused:
			return { color: 'blue', variant: 'filled' };
		default:
			return { color: 'blue', variant: 'filled' };
	}
};

export const orderStatusBadgeClass = (status: OrderStatus): BadgeAttr => {
	// NOTE: Those badge classes are found on: https://v5.daisyui.com/components/badge/

	switch (status) {
		case OrderStatus.Canceled:
			return { color: 'red', variant: 'filled' };
		case OrderStatus.Draft:
			return { color: 'gray', variant: 'outline' };
		case OrderStatus.Expired:
			return { color: 'blue', variant: 'light' };
		case OrderStatus.Fulfilled:
			return { color: 'green', variant: 'filled' };
		case OrderStatus.PartiallyFulfilled:
			return { color: 'blue', variant: 'filled' };
		case OrderStatus.PartiallyReturned:
			return { color: 'blue', variant: 'filled' };
		case OrderStatus.Returned:
			return { color: 'yellow', variant: 'filled' };
		case OrderStatus.Unconfirmed:
			return { color: 'gray', variant: 'light' };
		case OrderStatus.Unfulfilled:
			return { color: 'orange', variant: 'light' };
		default:
			return { color: 'blue', variant: 'filled' };
	}
};

