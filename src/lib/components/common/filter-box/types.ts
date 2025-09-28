import type { Snippet } from 'svelte';

export type FilterOperator = 'oneOf' | 'lte' | 'gte' | 'range' | 'eq';

/** This type is used for extra filters other than paginations */
// export type FilterProps<T> = {
// 	label: string;
// 	key: keyof T;
// 	operations: Partial<Record<FilterOperator, Snippet<[FilterComponentType]>>>;
// 	/**
// 	 * In case this filter must be used with another filter
// 	 */
// 	mustPairWith?: keyof T;
// };

export type FilterProps<T> = Partial<Record<keyof T, {
	label: string;
	operations: Partial<Record<FilterOperator, Snippet<[FilterComponentType]>>>;
	/**
	 * In case this filter must be used with another filter
	 */
	mustPairWith?: keyof T;
}>>

export type FilterComponentType = {
	onValue: FilterComponentCallback;
	initialValue?: FilterItemValue;
	placeholder?: string;
};

export type FilterConditions<T> = Record<
	keyof T,
	Partial<{ operator: FilterOperator; value: FilterItemValue }>
>;

export type FilterItemValue = string[] | number[] | boolean[] | string | number | boolean;

export type FilterComponentCallback = (value: FilterItemValue) => void;
