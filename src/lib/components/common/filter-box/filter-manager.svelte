<script lang="ts" generics="T">
	import type { GraphqlPaginationArgs } from '$lib/components/ui/Table';
	import type { AnyVariables } from '@urql/core';
	import type { FilterConditions, FilterProps } from './types';
	import { Input } from '$lib/components/ui/Input';
	import { get, has, set } from 'es-toolkit/compat';
	import {
		AFTER,
		BEFORE,
		FIRST,
		LAST,
		ORDER_BY_FIELD,
		ORDER_DIRECTION,
		SEARCH_QUERY,
	} from '$lib/components/pages/home/common';
	import { afterNavigate, goto } from '$app/navigation';
	import { OrderDirection } from '$lib/gql/graphql';
	import { page } from '$app/state';
	import { FILTER_RANGE_REGEX, METADATA_PAIR_REGEX, parseUrlSearchParams } from '$lib/utils/utils';
	import { type DropdownTriggerInterface, Popover } from '$lib/components/ui/Popover';
	import { Button } from '$lib/components/ui';
	import FilterBox from './filter-box.svelte';
	import { FilterCog } from '$lib/components/icons';
	import { untrack } from 'svelte';

	type Props = {
		filterOptions: FilterProps<T>[];
		variables: AnyVariables & GraphqlPaginationArgs;
		/** if provided, will display the text box for search query input as well */
		searchKey?: string;
		forceReExecuteGraphqlQuery: boolean;
	};

	let {
		filterOptions,
		variables = $bindable(),
		searchKey,
		forceReExecuteGraphqlQuery = $bindable(false),
	}: Props = $props();

	if (searchKey && !has(variables, searchKey))
		throw new Error(
			`invalid key provided "${searchKey}" or you forget to initialize the path ${searchKey} for your variable?`,
		);

	const FILTER_KEYS_MAP = filterOptions.reduce(
		(acc, { key }) => {
			acc[key as string] = true;
			return acc;
		},
		{} as Record<string, boolean>,
	);

	let openFilterBox = $state(false);
	let filters = $state<FilterConditions<T>>({} as FilterConditions<T>);
	let filtersCount = $derived(Object.keys(filters).length);

	// $inspect(filters);

	// $inspect(filters);

	const onInput = (evt: Event) => {
		if (!searchKey) return;

		const newVariables = { ...variables };
		set(newVariables, searchKey, (evt.target as HTMLInputElement).value.trim());
		variables = newVariables;
	};

	const handlePaginationNavigation = async () => {
		const params = page.url.searchParams;

		if (variables.first) {
			params.set(FIRST, variables.first.toString());

			if (variables.after) {
				params.set(AFTER, variables.after);
			}
		} else if (variables.last) {
			params.set(LAST, variables.last.toString());

			if (variables.before) {
				params.set(BEFORE, variables.before);
			}
		}

		// sorting
		if (variables.sortBy?.field) {
			params.set(ORDER_BY_FIELD, variables.sortBy.field);
			const direction = variables.sortBy.direction || OrderDirection.Asc; // if not set, default to ascending;
			params.set(ORDER_DIRECTION, direction);
		}

		// check for search query string change
		if (searchKey) {
			const query = get(variables, searchKey);
			if (query) params.set(SEARCH_QUERY, query);
		}

		let hasSomethingChanged = false;

		params.forEach((value, key) => {
			hasSomethingChanged ||= page.url.searchParams.get(key) != value;
		});

		if (hasSomethingChanged) {
			forceReExecuteGraphqlQuery = true;
			await goto(`${page.url.pathname}?${params.toString()}`);
		}
	};

	// listener for variable changes
	$effect(() => {
		handlePaginationNavigation();
	});

	// listener for variables changed have been applied on the URL bar
	afterNavigate(async () => {
		scrollTo({ top: 0, behavior: 'smooth' });

		// debugger;

		const queryParams = parseUrlSearchParams(page.url);
		const newVariables = { ...variables };
		const newFilters = {} as FilterConditions<T>;

		for (const key in queryParams) {
			switch (key) {
				case FIRST:
					if (typeof queryParams[FIRST] === 'number') {
						newVariables.first = queryParams[FIRST];
						newVariables.last = null;
						newVariables.before = null;
					}
					continue;
				case AFTER:
					if (typeof queryParams[AFTER] === 'string') {
						newVariables.after = queryParams[AFTER];
					}
					continue;
				case LAST:
					if (typeof queryParams[LAST] === 'number') {
						newVariables.last = queryParams[LAST];
						newVariables.first = null;
						newVariables.after = null;
					}
					continue;
				case BEFORE:
					if (typeof queryParams[BEFORE] === 'string') {
						newVariables.before = queryParams[BEFORE];
					}
					continue;
				case ORDER_BY_FIELD:
					if (typeof queryParams[ORDER_BY_FIELD] === 'string') {
						const direction =
							(queryParams[ORDER_DIRECTION] as OrderDirection) || OrderDirection.Asc;

						newVariables.sortBy = {
							field: queryParams[ORDER_BY_FIELD],
							direction,
						};
					}
				case ORDER_DIRECTION:
					continue;
				case SEARCH_QUERY:
					if (searchKey) {
						set(newVariables, searchKey, queryParams[SEARCH_QUERY]);
					}

				default:
					// all the custom filter cases:
					if (!FILTER_KEYS_MAP[key]) continue;

					const value = queryParams[key];

					if (
						typeof value === 'number' ||
						typeof value === 'boolean' ||
						(!FILTER_RANGE_REGEX.test(value) && !METADATA_PAIR_REGEX.test(value))
					) {
						newFilters[key as keyof T] = {
							operator: 'eq',
							value,
						};
						continue;
					}

					const rangeMatches = FILTER_RANGE_REGEX.exec(value);
					if (rangeMatches) {
						const gte = rangeMatches[1].trim();
						const lte = rangeMatches[2].trim();

						if (gte || lte) {
							if (gte !== 'null' && lte !== 'null') {
								// filtersResult[key as keyof T] = {
								// 	gte,
								// 	lte,
								// };
								newFilters[key as keyof T] = {
									operator: 'range',
									value: [gte, lte],
								};
							} else if (gte !== 'null') {
								// filtersResult[key as keyof T] = {
								// 	gte,
								// };
								newFilters[key as keyof T] = {
									operator: 'gte',
									value: gte,
								};
							} else if (lte !== 'null') {
								// filtersResult[key as keyof T] = {
								// 	lte,
								// };
								newFilters[key as keyof T] = {
									operator: 'lte',
									value: lte,
								};
							}
						}
						continue;
					}

					const metadataMatches = METADATA_PAIR_REGEX.exec(value);
					if (metadataMatches) {
						const key = metadataMatches[1].trim();
						const value = metadataMatches[2].trim();

						newFilters[key as keyof T] = {
							operator: 'eq',
							value: [key, value],
						};
					}
			}
		}

		filters = newFilters;

		// if (
		// 	newVariables.first !== variables.first ||
		// 	newVariables.last !== variables.last ||
		// 	newVariables.after !== variables.after ||
		// 	newVariables.before !== variables.before ||
		// 	newVariables.sortBy?.field !== variables.sortBy?.field ||
		// 	newVariables.sortBy?.direction !== variables.sortBy?.direction ||
		// 	(searchKey && get(variables, searchKey) !== get(newVariables, searchKey))
		// )
		variables = newVariables;
	});

	const handleApplyCustomFilter = async (filters: FilterConditions<T>) => {
		const keys = Object.keys(filters);
		if (!keys.length) return;

		const params = page.url.searchParams; // add filter conditions to existing params

		for (const key of keys) {
			const filterOpt = filters[key as keyof T];
			if (!filterOpt) continue;

			if (filterOpt.operator === 'lte') {
				params.set(key, `[null,${filterOpt.value}]`);
			} else if (filterOpt.operator === 'gte') {
				params.set(key, `[${filterOpt.value},null]`);
			} else if (filterOpt.operator === 'oneOf') {
				params.set(key, JSON.stringify(filterOpt.value));
			} else if (filterOpt.operator === 'range' && Array.isArray(filterOpt.value)) {
				params.set(key, `[${filterOpt.value[0]},${filterOpt.value[1]}]`);
			} else if (filterOpt.operator === 'eq') {
				/**
				 * There are a few cases for `eq` operator:
				 * 1) equal to a pair of `key-value` record,
				 */
				if (Array.isArray(filterOpt.value)) {
					params.set(key, `{${filterOpt.value[0]},${filterOpt.value[1]}}`);
				} else {
					// 2) equal to primitives, E.g: slug='hello-world';
					params.set(key, `${filterOpt.value}`);
				}
			}
		}

		openFilterBox = false; //

		await goto(`${page.url.pathname}?${params.toString()}`);
	};
</script>

<div class="flex items-center gap-2 mb-2">
	{#snippet trigger(opts: DropdownTriggerInterface)}
		<Button variant="outline" size="sm" {...opts} class="indicator" endIcon={FilterCog}>
			{#if filtersCount}
				<span class="indicator-item badge badge-xs text-white! bg-blue-500">{filtersCount}</span>
			{/if}
			Filters
		</Button>
	{/snippet}

	<Popover {trigger} placement="bottom-start" bind:open={openFilterBox}>
		<FilterBox
			header="Filters"
			options={filterOptions}
			onApply={handleApplyCustomFilter}
			{filters}
			class="min-w-96"
			onClose={() => (openFilterBox = false)}
		/>
	</Popover>
	{#if searchKey}
		<Input
			placeholder="Enter your query"
			size="sm"
			value={get(variables, searchKey)}
			inputDebounceOption={{ onInput, debounceTime: 888 }}
		/>
	{/if}
</div>
