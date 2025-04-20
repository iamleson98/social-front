import type { Snippet } from "svelte";

export type FilterOperator = 'in' | 'lower' | 'greater' | 'between' | 'is';

export type FilterProps = {
  label: string;
  key: string;
  operation: {
    operator: FilterOperator;
    component: Snippet<[{ onValue: FilterComponentCallback }]>;
  }[];
};

export type FilterComponentCallback = (value: string[] | number[] | string | number) => void;
