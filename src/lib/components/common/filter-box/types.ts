import type { Snippet } from "svelte";

export type FilterOperator = 'oneOf' | 'lte' | 'gte' | 'range' | 'eq';

export type FilterProps<T, C extends FilterComponentType = FilterComponentType> = {
  label: string;
  key: keyof T;
  operations: {
    operator: FilterOperator;
    component: Snippet<[C]>;
  }[];
  /**
   * In case this filter must be used with another filter
   */
  mustPairWith?: keyof T;
};

export type FilterComponentType = {
  onValue: FilterComponentCallback;
  initialValue?: FilterItemValue;
  placeholder?: string;
}

export type FilterConditions<T> = Record<keyof T, Partial<{ operator: FilterOperator; value: FilterItemValue }>>;

export type FilterResult<T> = Record<keyof T, Partial<Record<FilterOperator, FilterItemValue>> | boolean>;

export type FilterItemValue = string[] | number[] | boolean[] | string | number | boolean;

export type FilterComponentCallback = (value: FilterItemValue) => void;
