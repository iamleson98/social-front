import type { Snippet } from "svelte";

export type FilterOperator = 'in' | 'lower' | 'greater' | 'between' | 'is';

export type FilterProps = {
  label: string;
  key: string;
  operation: {
    operator: FilterOperator;
    component: Snippet<[FilterComponentType]>;
  }[];
};

export type FilterComponentType = {
  onValue: FilterComponentCallback;
  initialValue?: FilterItemValue;
}

export type SingleFilter = {
  key: string;
  operator: FilterOperator;
  value?: FilterItemValue;
};

export type FilterItemValue = string[] | number[] | boolean[] | string | number | boolean;

export type FilterComponentCallback = (value: FilterItemValue) => void;
