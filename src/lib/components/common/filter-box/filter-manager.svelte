<script lang="ts" generics="T, Var extends (AnyVariables & GraphqlPaginationArgs)">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { FilterCog, Search } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import { type DropdownTriggerInterface, Popover } from '$lib/components/ui/Popover';
	import type { GraphqlPaginationArgs } from '$lib/components/ui/Table';
	import { OrderDirection } from '$lib/gql/graphql';
	import { SearchParamKey } from '$lib/utils/consts';
	import {
		FILTER_COMPARE_RANGE_REGEX,
		FILTER_KEY_VALUE_PAIR_REGEX,
		FILTER_ONE_OF_RANGE_REGEX,
		parseUrlSearchParams,
	} from '$lib/utils/utils';
	import FilterContainer from './filter-container.svelte';
	import type { FilterConditions, FilterProps } from './types';
	import type { AnyVariables } from '@urql/core';
	import { get, set, unset } from 'es-toolkit/compat';

	type Props = {
		/** if not provided, will not show filter button */
		filterOptions?: FilterProps<T>[];
		variables: Var;
		/** if provided, will display the text box for search query input as well */
		searchKey?: keyof Var | string;
		forceReExecuteGraphqlQuery: boolean;
		disabled?: boolean;
	};

	let {
		filterOptions = [],
		variables = $bindable(),
		searchKey,
		forceReExecuteGraphqlQuery = $bindable(false),
		disabled,
	}: Props = $props();

	// if (searchKey && !has(variables, searchKey))
	// 	throw new Error(
	// 		`invalid key provided "${String(searchKey)}" or you forget to initialize the path "${String(searchKey)}"" for your variable?`,
	// 	);

	let openFilterBox = $state(false);
	let filters = $state.raw({} as FilterConditions<T>);
	let filtersCount = $derived(Object.keys(filters).length);

	const FILTER_MAP = filterOptions.reduce(
		(acc, cur) => {
			acc[cur.key] = cur;
			return acc;
		},
		{} as Record<keyof T, FilterProps<T, Var>>,
	);

	const handleSearchValueChange = async (evt: Event) => {
		const value = (evt.target as HTMLInputElement).value.trim();
		page.url.searchParams.set(SearchParamKey.SEARCH_QUERY, value);

		await goto(`${page.url.pathname}?${page.url.searchParams.toString()}`, { keepFocus: true });
	};

	// listener for pagination, sorting changes
	// $effect(() => {
	// 	const pageSortField = page.url.searchParams.get(SearchParamKey.ORDER_BY_FIELD);
	// 	const pageSortDirection = page.url.searchParams.get(SearchParamKey.ORDER_DIRECTION);
	// 	const pageFirst = page.url.searchParams.get(SearchParamKey.FIRST);
	// 	const pageLast = page.url.searchParams.get(SearchParamKey.LAST);
	// 	const pageAfter = page.url.searchParams.get(SearchParamKey.AFTER);
	// 	const pageBefore = page.url.searchParams.get(SearchParamKey.BEFORE);

	// 	const variableSortField = variables.sortBy?.field;
	// 	const variableSortDirection = variables.sortBy?.direction || OrderDirection.Asc;
	// 	const variableFirst = variables.first;
	// 	const variableLast = variables.last;
	// 	const variableAfter = variables.after;
	// 	const variableBefore = variables.before;

	// 	let shouldNavigate = false;

	// 	if (typeof variableSortField === 'string') {
	// 		if (pageSortField !== variableSortField || pageSortDirection !== variableSortDirection) {
	// 			page.url.searchParams.set(SearchParamKey.ORDER_BY_FIELD, variableSortField);
	// 			page.url.searchParams.set(SearchParamKey.ORDER_DIRECTION, variableSortDirection);
	// 			shouldNavigate = true;
	// 		}
	// 	}

	// 	if (pageFirst != variableFirst || pageAfter != variableAfter) {
	// 		page.url.searchParams.set(SearchParamKey.FIRST, String(variableFirst));
	// 		page.url.searchParams.delete(SearchParamKey.LAST);
	// 		page.url.searchParams.delete(SearchParamKey.BEFORE);
	// 		if (variableAfter) page.url.searchParams.set(SearchParamKey.AFTER, variableAfter);
	// 		shouldNavigate = true;
	// 	}

	// 	if (pageLast != variableLast || pageBefore != variableBefore) {
	// 		page.url.searchParams.set(SearchParamKey.LAST, String(variableLast));
	// 		page.url.searchParams.delete(SearchParamKey.FIRST);
	// 		page.url.searchParams.delete(SearchParamKey.AFTER);
	// 		if (variableBefore) page.url.searchParams.set(SearchParamKey.BEFORE, variableBefore);
	// 		shouldNavigate = true;
	// 	}

	// 	if (shouldNavigate) {
	// 		goto(`${page.url.pathname}?${page.url.searchParams.toString()}`);
	// 	}
	// });

	// listener for variables changed have been applied on the URL bar
	afterNavigate(async () => {
		scrollTo({ top: 0, behavior: 'smooth' });

		const queryParams = parseUrlSearchParams(page.url);
		const newVariables = { ...variables };
		const newFilters = {} as FilterConditions<T>;

		for (const key in queryParams) {
			switch (key) {
				case SearchParamKey.FIRST:
					if (typeof queryParams[SearchParamKey.FIRST] === 'number') {
						newVariables.first = queryParams[SearchParamKey.FIRST];
						newVariables.last = null;
						newVariables.before = null;
					}
					continue;
				case SearchParamKey.AFTER:
					if (typeof queryParams[SearchParamKey.AFTER] === 'string') {
						newVariables.after = queryParams[SearchParamKey.AFTER];
					}
					continue;
				case SearchParamKey.LAST:
					if (typeof queryParams[SearchParamKey.LAST] === 'number') {
						newVariables.last = queryParams[SearchParamKey.LAST];
						newVariables.first = null;
						newVariables.after = null;
					}
					continue;
				case SearchParamKey.BEFORE:
					if (typeof queryParams[SearchParamKey.BEFORE] === 'string') {
						newVariables.before = queryParams[SearchParamKey.BEFORE];
					}
					continue;
				case SearchParamKey.ORDER_BY_FIELD:
					if (typeof queryParams[SearchParamKey.ORDER_BY_FIELD] === 'string') {
						newVariables.sortBy = {
							field: queryParams[SearchParamKey.ORDER_BY_FIELD],
							direction:
								(queryParams[SearchParamKey.ORDER_DIRECTION] as OrderDirection) ||
								OrderDirection.Asc,
						};
					}
					continue;
				case SearchParamKey.ORDER_DIRECTION:
					continue;
				case SearchParamKey.SEARCH_QUERY:
					if (searchKey) {
						if (queryParams[SearchParamKey.SEARCH_QUERY])
							set(newVariables, searchKey, queryParams[SearchParamKey.SEARCH_QUERY]);
						else unset(newVariables, searchKey);
					}
					continue;

				default:
					// all the custom filter cases:
					if (!FILTER_MAP[key as keyof T]) continue;
					const operations = FILTER_MAP[key as keyof T].operations;

					const value = queryParams[key];

					if (
						typeof value === 'number' ||
						typeof value === 'boolean' ||
						(!FILTER_COMPARE_RANGE_REGEX.test(value) &&
							!FILTER_KEY_VALUE_PAIR_REGEX.test(value) &&
							!FILTER_ONE_OF_RANGE_REGEX.test(value))
					) {
						newFilters[key as keyof T] = {
							operator: 'eq',
							value,
						};
						continue;
					}

					// comparison filter
					const rangeMatches = FILTER_COMPARE_RANGE_REGEX.exec(value);
					if (rangeMatches) {
						const gte = rangeMatches[1].trim();
						const lte = rangeMatches[2].trim();

						if (gte || lte) {
							if (gte !== 'null' && lte !== 'null') {
								newFilters[key as keyof T] = {
									operator: 'range',
									value: [gte, lte],
								};
							} else if (gte !== 'null') {
								newFilters[key as keyof T] = {
									operator: 'gte',
									value: gte,
								};
							} else if (lte !== 'null') {
								newFilters[key as keyof T] = {
									operator: 'lte',
									value: lte,
								};
							}
						}
						continue;
					}

					// one of
					const oneOfMatches = FILTER_ONE_OF_RANGE_REGEX.exec(value);
					if (oneOfMatches) {
						const values = JSON.parse(value);
						const operation = operations.find((opt) => opt.operator === 'oneOf');
						if (operation && operation.setBackValue) operation.setBackValue(newVariables, values);

						newFilters[key as keyof T] = {
							operator: 'oneOf',
							value: values,
						};
						continue;
					}

					// metadata filter
					const metadataMatches = FILTER_KEY_VALUE_PAIR_REGEX.exec(value);
					if (metadataMatches) {
						const key = metadataMatches[1].trim();
						const value = metadataMatches[2].trim();
						const operation = operations.find((op) => op.operator === 'eq');
						if (operation && operation.setBackValue)
							operation.setBackValue(newVariables, [{ key, value }]);

						newFilters[key as keyof T] = {
							operator: 'eq',
							value: [key, value],
						};
					}
			}
		}

		filters = newFilters;
		variables = newVariables;
		forceReExecuteGraphqlQuery = true;
	});
</script>

<div class="flex items-center gap-2">
	{#if filterOptions.length}
		<Popover placement="bottom-start" bind:open={openFilterBox}>
			{#snippet trigger(opts: DropdownTriggerInterface)}
				<Button
					variant="outline"
					size="sm"
					{...opts}
					class="indicator"
					endIcon={FilterCog}
					{disabled}
				>
					{#if filtersCount}
						<span class="indicator-item badge badge-xs text-white! bg-blue-500">
							{filtersCount}
						</span>
					{/if}
					{$tranFunc('common.filter')}
				</Button>
			{/snippet}
			<FilterContainer {filterOptions} bind:open={openFilterBox} {filters} />
		</Popover>
	{/if}
	{#if searchKey}
		<Input
			placeholder={$tranFunc('placeholders.valuePlaceholder')}
			size="sm"
			{disabled}
			value={get(variables, searchKey)}
			inputDebounceOption={{ onInput: handleSearchValueChange, debounceTime: 888 }}
			startIcon={Search}
		/>
	{/if}
</div>
