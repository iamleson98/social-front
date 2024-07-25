import { type SelectedAttribute, AttributeInputTypeEnum } from '$lib/gql/graphql';
import { t } from '$lib/i18n';
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
  const formatter =  new Intl.NumberFormat('en-US', {
    style: "currency",
    currency,
  });
  if (endAmount) {
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
      return attribute.values[0].boolean ? $t('common.yesIcon') : $t('common.noIcon');
    case AttributeInputTypeEnum.PlainText:
      return attribute.values[0].name;
    case AttributeInputTypeEnum.Multiselect:
      // return attribute.values[0].boolean ? $t('common.yesIcon') : $t('common.noIcon');
      return attribute.values.join(', ');

    default:
      return attribute.values[0].value;
  }
};
