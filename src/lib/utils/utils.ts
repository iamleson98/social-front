import { base } from '$app/paths';
import { type SelectedAttribute, AttributeInputTypeEnum } from '$lib/gql/graphql';
import { tClient } from '$lib/i18n';
import { toastStore } from '$lib/stores/ui/toast';
import type { AnyVariables, OperationResult } from '@urql/core';
import editorJsToHtml from 'editorjs-html';


export const editorJsParser = editorJsToHtml();

export const randomID = () => '_' + Math.random().toString(36).substring(2, 9);

export type PaginationOptions = {
  before?: string | null | undefined;
  after?: string | null | undefined;
  first?: number | null | undefined;
  last?: number | null | undefined;
};

export function constructPagination<T extends PaginationOptions>(before?: string, after?: string, first?: number, last?: number) {
  const pagination: Pick<T, 'before' | 'after' | 'first' | 'last'> = {};
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
  if (!attribute.attribute.inputType) {
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
 * A shortcut to handle the result of a GraphQL query or mutation.
 * @param result GraphQl query, operation results
 * @returns `true` if there is an error, `false` otherwise.
 */
export const handleResult = <T, K extends AnyVariables>(result: OperationResult<T, K>): boolean => {
  if (result.error) {
    toastStore.send({
      message: result.error.message,
      variant: 'error',
    });
    return true;
  }

  return false;
}
