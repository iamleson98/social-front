import { OrderDirection, type MetadataItem, type PageInfo } from "$lib/gql/graphql";
import type { PaginationOptions } from "$lib/utils/utils";
import type { ObjectLiteral, SelectQueryBuilder } from "typeorm";

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

export const RFC3339TimeFormat = "YYYY-MM-DDTHH:mm:ssZ";

export const RFC3339TimeRegex = new RegExp(RFC3339TimeFormat);

export const encodeBase64Cursor = (kclass: string, key: unknown) => {
  return btoa(`${kclass}:${key}`);
}

export const decodeBase64Cursor = (cursor: string) => {
  const [className, key] = splitN(atob(cursor), ":", 1);
  return { className, key };
}

export const addPaginOptionsToQuery = <T extends ObjectLiteral>(query: SelectQueryBuilder<T>, fieldName: string, paginOpts?: PaginationOptions) => {
  if (!paginOpts) return query;

  const limit = getLimit(paginOpts);
  if (limit) query = query.limit(limit);

  const [cursor, operator] = paginOpts.before ? [paginOpts.before, '<'] : [paginOpts.after, '>'];
  if (cursor) {
    const { key } = decodeBase64Cursor(cursor);
    if (RFC3339TimeRegex.test(key)) {
      const value = dateFromRFC3339(key);
      query = query.andWhere(`${fieldName} ${operator} :value`, { value });
    }
  }

  const orderDirection = getOrderDirection(paginOpts);
  return query.orderBy(fieldName, orderDirection, "NULLS LAST");
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

export const createGraphqlPageInfo = <T extends ObjectLiteral>(paginOpts: PaginationOptions, results: T[]): PageInfo => {
  const limit = getLimit(paginOpts);
  const hasNextPage = results.length >= (limit || 0);
  const hasPreviousPage = !!paginOpts.before || !!paginOpts.after;
  return {
    hasNextPage,
    hasPreviousPage,
  };
};

export const objectToMetaItemList = (obj: Record<string, unknown>): MetadataItem[] => {
  return Object.keys(obj).map(key => {
    return {
      key,
      value: `${obj[key]}`,
    };
  });
};
