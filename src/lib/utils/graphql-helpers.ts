/**
 * Shared date / cursor / metadata helpers.
 *
 * Previously these lived in `src/lib/api/graphql/utils` next to a TypeORM +
 * graphql-yoga backend that was never wired up — that backend was removed and
 * only these pure functions, which the storefront actually imports, remain.
 */
import { OrderDirection, type MetadataItem, type PageInfo } from '$lib/gql/graphql';
import type { PaginationOptions } from '$lib/utils/utils';

/**
 * Split a string into an array of substrings based on a delimiter and a maximum number of splits.
 * @param delimiter The delimiter to use for splitting.
 * @param n The maximum number of splits to perform.
 * @returns An array of substrings.
 */
export function splitN(str: string, delimiter: string, n: number) {
	if (n === 0) return [str];

	const parts = str.split(delimiter);
	if (n >= parts.length) return parts;

	return parts.slice(0, n).concat(parts.slice(n).join(delimiter));
}

/**
 * Convert date to RFC3339 format
 */
export function dateToRFC3339(date: Date) {
	return date.toISOString().replace('Z', '+00:00');
}

/**
 * Convert RFC3339 format to date
 */
export function dateFromRFC3339(rfc3339String: string) {
	const isoString = rfc3339String.replace(/([+-]\d{2}):(\d{2})$/, 'Z');
	return new Date(isoString);
}

export const RFC3339TimeFormat = 'YYYY-MM-DDTHH:mm:ssZ';

export const RFC3339TimeRegex = new RegExp(RFC3339TimeFormat);

export const ISO8061TimeFormat = 'YYYY-MM-DDTHH:mm';

export const encodeBase64Cursor = (kclass: string, key: unknown) => {
	return btoa(`${kclass}:${key}`);
};

export const decodeBase64Cursor = (cursor: string) => {
	const [className, key] = splitN(atob(cursor), ':', 1);
	return { className, key };
};

export const getLimit = (opts: PaginationOptions) => {
	if (opts.first) return opts.first + 1;
	if (opts.last) return opts.last + 1;
	return undefined;
};

export const getOrderDirection = (opts: PaginationOptions): OrderDirection => {
	if (opts.last) return OrderDirection.Desc;
	return OrderDirection.Asc;
};

export const createGraphqlPageInfo = (
	paginOpts: PaginationOptions,
	resultCount: number,
): PageInfo => {
	const limit = getLimit(paginOpts);
	const hasNextPage = resultCount >= (limit || 0);
	const hasPreviousPage = !!paginOpts.before || !!paginOpts.after;
	return {
		hasNextPage,
		hasPreviousPage,
	};
};

export const objectToMetaItemList = (obj: Record<string, unknown>): MetadataItem[] => {
	return Object.keys(obj).map((key) => {
		return {
			key,
			value: `${obj[key]}`,
		};
	});
};
