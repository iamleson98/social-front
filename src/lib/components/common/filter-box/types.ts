import type { Snippet } from "svelte";

export type FilterOperator = 'oneOf' | 'lte' | 'gte' | 'range' | 'eq';

export type FilterProps<T> = {
  label: string;
  key: keyof T;
  operation: {
    operator: FilterOperator;
    component: Snippet<[FilterComponentType]>;
  }[];
};

export type FilterComponentType = {
  onValue: FilterComponentCallback;
  initialValue?: FilterItemValue;
  placeholder?: string;
}

export type SingleFilter<T> = {
  key: keyof T;
  operator: FilterOperator;
  value?: FilterItemValue;
};

export type FilterConditions<T> = Record<keyof T, Record<FilterOperator, FilterItemValue>>;

export type FilterItemValue = string[] | number[] | boolean[] | string | number | boolean;

export type FilterComponentCallback = (value: FilterItemValue) => void;
