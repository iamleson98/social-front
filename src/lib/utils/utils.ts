import { base } from '$app/paths';
import { type SelectedAttribute, AttributeInputTypeEnum } from '$lib/gql/graphql';
import { tClient } from '$lib/i18n';
import { toastStore } from '$lib/stores/ui/toast';
import type { AnyVariables, OperationResult } from '@urql/core';
import editorJsToHtml from 'editorjs-html';
import { AppRoute } from './routes';


export const editorJsParser = editorJsToHtml();

let count = 0;
export const randomID = () => (++count).toString(36);

/**
 * this type represents the graphql query params that are used for pagination.
 */
export type PaginationOptions = {
  before?: string;
  after?: string;
  first?: number;
  last?: number;
};

/**
  * A helper method that takes any type that have `before`, `after`, `first`, `last` fields and construct a pagination object.
 */
export function constructPaginationParams<T extends PaginationOptions>({ before, after, first, last }: T): PaginationOptions {
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
};

export const formatMoney = (currency: string, startAmount: number, endAmount?: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: "currency",
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
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const replaceLocaleInUrl = (url: URL, locale: string, full = false) => {
  const [, , ...rest] = getPathnameWithoutBase(url).split('/')
  const new_pathname = `/${[locale, ...rest].join('/')}`
  if (!full) {
    return `${new_pathname}${url.search}`
  }
  const newUrl = new URL(url.toString())
  newUrl.pathname = base + new_pathname
  return newUrl.toString()
};

const REGEX_START_WITH_BASE = new RegExp(`^${base}`)

export const getPathnameWithoutBase = (url: URL) => url.pathname.replace(REGEX_START_WITH_BASE, '');

/**
 * If given `result` has an error, it will show a toast message with the error message.
 * @param result GraphQl query, operation results
 * @returns `true` if there is an error, `false` otherwise.
 */
export const preHandleGraphqlResult = <T, K extends AnyVariables>(result: OperationResult<T, K>): boolean => {
  if (result.error) {
    toastStore.send({
      message: result.error.message,
      variant: 'error',
    });
    return true;
  }

  return false;
}

export type PredicateFunc<T> = (obj: T) => boolean;

export const recursiveSearch = <T extends { children?: T[] }>(arr: T[], prec: PredicateFunc<T>): T | null => {
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
