import type { Snippet } from "svelte";
import type { SvelteMap } from "svelte/reactivity";

export type FilterOperator = 'oneOf' | 'lte' | 'gte' | 'range' | 'eq';

export type FilterProps<T> = {
  label: string;
  key: keyof T;
  operations: {
    operator: FilterOperator;
    component: Snippet<[FilterComponentType]>;
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

export type FilterConditions<T> = SvelteMap<keyof T, Partial<{ operator: FilterOperator; value: FilterItemValue }>>;

export type FilterResult<T> = Partial<Record<keyof T, Partial<Record<FilterOperator, FilterItemValue>>>>;

export type FilterItemValue = string[] | number[] | boolean[] | string | number | boolean;

export type FilterComponentCallback = (value: FilterItemValue) => void;
