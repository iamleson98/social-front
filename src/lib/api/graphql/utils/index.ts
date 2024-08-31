import { OrderDirection, type MetadataItem, type PageInfo } from "$lib/gql/graphql";
import type { PaginationOptions } from "$lib/utils/utils";
import type { ObjectLiteral, SelectQueryBuilder } from "typeorm";


export function splitN(str: string, delimiter: string, n: number) {
  // If n is 0, return the original string in an array
  if (n === 0) return [str];

  // Split the string using the specified delimiter
  const parts = str.split(delimiter);

  // If n is greater than or equal to the number of splits, return the parts as is
  if (n >= parts.length) return parts;

  // Join the remaining parts back together if n is less than the number of splits
  const result = parts.slice(0, n).concat(parts.slice(n).join(delimiter));

  return result;
}


export function dateToRFC3339(date: Date) {
  // Convert to ISO string
  const isoString = date.toISOString();

  // Replace 'Z' with '+00:00' to match RFC 3339
  return isoString.replace('Z', '+00:00');
}

export function dateFromRFC3339(rfc3339String: string) {
  // Replace the RFC 3339 timezone offset with 'Z' for UTC
  const isoString = rfc3339String.replace(/([+-]\d{2}):(\d{2})$/, 'Z');

  // Create a Date object from the ISO string
  return new Date(isoString);
}

/** borrowed from golang source code  */
export const RFC3339 = "2023-08-31T12:34:56+00:00";

export const RFC3339Regex = new RegExp(RFC3339);

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

  if (paginOpts.before) {
    const { key } = decodeBase64Cursor(paginOpts.before);
    let value: unknown = key;
    if (RFC3339Regex.test(key)) {
      value = new Date(dateFromRFC3339(key));
    }
    query = query.andWhere(`${fieldName} < :value`, { value });
  } else if (paginOpts.after) {
    const { key } = decodeBase64Cursor(paginOpts.after);
    let value: unknown = key;
    if (RFC3339Regex.test(key)) {
      value = new Date(dateFromRFC3339(key));
    }
    query = query.andWhere(`${fieldName} > :value`, { value });
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
