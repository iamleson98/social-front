import type { GraphqlPaginationArgs } from "$lib/components/ui/Table";
import type { AnyVariables } from "@urql/core";
import type { Snippet } from "svelte";

export type FilterOperator = 'oneOf' | 'lte' | 'gte' | 'range' | 'eq';

export type FilterProps<T, Var extends (AnyVariables & GraphqlPaginationArgs) = (AnyVariables & GraphqlPaginationArgs)> = {
  label: string;
  key: keyof T;
  operations: {
    operator: FilterOperator;
    component: Snippet<[FilterComponentType]>;
    /** a way to tell the component how to set back the input values to your filter variable */
    setBackValue?: (entity: Var, value: unknown) => void;
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
};

export type FilterConditions<T> = Record<keyof T, Partial<{ operator: FilterOperator; value: FilterItemValue }>>;

export type FilterItemValue = string[] | number[] | boolean[] | string | number | boolean;

export type FilterComponentCallback = (value: FilterItemValue) => void;
