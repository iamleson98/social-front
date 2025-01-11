import { type SelectedAttribute, AttributeInputTypeEnum, OrderDirection } from '$lib/gql/graphql';
import { tClient } from '$lib/i18n';
import { toastStore } from '$lib/stores/ui/toast';
import type { AnyVariables, OperationResult } from '@urql/core';
import editorJsToHtml from 'editorjs-html';
import { AppRoute } from './routes';
import xss from 'xss';


export const editorJsParser = editorJsToHtml();

let _counter = 0;
export const randomID = () => {
	_counter++;
	return _counter.toString(36);
};

export function randomString(length = 10) {
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
	before: string | null | undefined;
	after: string | null | undefined;
	first: number | null | undefined;
	last: number | null | undefined;
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
			return attribute.values[0].boolean ? tClient('common.yes') : tClient('common.no');
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
 * @returns `true` if there is an error, `false` otherwise.
 */
export const preHandleGraphqlResult = <T, K extends AnyVariables>(
	result: OperationResult<T, K>
): boolean => {
	if (result.error) {
		toastStore.send({
			message: result.error.message,
			variant: 'error'
		});
		return true;
	}

	return false;
};

export type PredicateFunc<T> = (obj: T) => boolean;

export const recursiveSearch = <T extends { children?: T[] }>(
	arr: T[],
	prec: PredicateFunc<T>
): T | null => {
	if (arr.length === 0) return null;

	for (const obj of arr) {
		if (prec(obj)) return obj;

		if (obj.children) {
			const res = recursiveSearch(obj.children, prec);
			if (res) {
				return res;
			}
		}
	}

	return null;
};

export const getHrefForVariant = (productSlug: string, variantID: string): string => {
	const pathName = `${AppRoute.PRODUCTS}/${encodeURIComponent(productSlug)}`;
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

type NestedObject = { [key: string]: unknown };

export function setValueByKey(
	obj: NestedObject,
	key: string,
	value: unknown,
	override: boolean = true // Default to true for overriding
): void {
	const keys = key.split('.'); // Split the key by dots
	let current = obj;

	for (let i = 0; i < keys.length; i++) {
		const k = keys[i];

		// If we are at the last key, set the value
		if (i === keys.length - 1) {
			if (override || !(k in current)) {
				// If the value is an object and we are not overriding, merge it
				if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
					current[k] = {
						...(current[k] || {}), // Preserve existing value if it is an object
						...value // Merge with the new object
					};
				} else {
					current[k] = value; // Set the value
				}
			}
		} else {
			// If the key does not exist, create an empty object
			if (!(k in current)) {
				current[k] = {};
			} else if (typeof current[k] !== 'object' || current[k] === null) {
				// If the current key is not an object, we can't go deeper
				current[k] = {};
			}
			current = current[k] as NestedObject; // Move deeper into the object
		}
	}
}

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

export const noop = () => { };
