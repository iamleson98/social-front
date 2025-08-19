<script lang="ts" generics="T, Var extends (AnyVariables & GraphqlPaginationArgs)">
	import type { GraphqlPaginationArgs } from '$lib/components/ui/Table';
	import type { AnyVariables } from '@urql/core';
	import type { FilterConditions, FilterProps } from './types';
	import { Input } from '$lib/components/ui/Input';
	import { get, set, unset } from 'es-toolkit/compat';
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
	import {
		FILTER_COMPARE_RANGE_REGEX,
		FILTER_KEY_VALUE_PAIR_REGEX,
		FILTER_ONE_OF_RANGE_REGEX,
		parseUrlSearchParams,
	} from '$lib/utils/utils';
	import { type DropdownTriggerInterface, Popover } from '$lib/components/ui/Popover';
	import { Button } from '$lib/components/ui';
	import { FilterCog, Search } from '$lib/components/icons';
	import FilterContainer from './filter-container.svelte';
	import { tranFunc } from '$i18n';

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
		if (!searchKey) return;

		const value = (evt.target as HTMLInputElement).value.trim();
		page.url.searchParams.set(SEARCH_QUERY, value);

		await goto(`${page.url.pathname}?${page.url.searchParams.toString()}`, { keepFocus: true });
	};

	// listener for pagination, sorting changes
	$effect(() => {
		const pageSortField = page.url.searchParams.get(ORDER_BY_FIELD);
		const pageSortDirection = page.url.searchParams.get(ORDER_DIRECTION);
		const pageFirst = page.url.searchParams.get(FIRST);
		const pageLast = page.url.searchParams.get(LAST);
		const pageAfter = page.url.searchParams.get(AFTER);
		const pageBefore = page.url.searchParams.get(BEFORE);

		const variableSortField = variables.sortBy?.field;
		const variableSortDirection = variables.sortBy?.direction || OrderDirection.Asc;
		const variableFirst = variables.first;
		const variableLast = variables.last;
		const variableAfter = variables.after;
		const variableBefore = variables.before;

		let shouldNavigate = false;

		if (typeof variableSortField === 'string') {
			if (pageSortField !== variableSortField || pageSortDirection !== variableSortDirection) {
				page.url.searchParams.set(ORDER_BY_FIELD, variableSortField);
				page.url.searchParams.set(ORDER_DIRECTION, variableSortDirection);
				shouldNavigate = true;
			}
		}

		if (pageFirst != variableFirst || pageAfter != variableAfter) {
			page.url.searchParams.set(FIRST, String(variableFirst));
			page.url.searchParams.delete(LAST);
			page.url.searchParams.delete(BEFORE);
			if (variableAfter) page.url.searchParams.set(AFTER, variableAfter);
			shouldNavigate = true;
		}

		if (pageLast != variableLast || pageBefore != variableBefore) {
			page.url.searchParams.set(LAST, String(variableLast));
			page.url.searchParams.delete(FIRST);
			page.url.searchParams.delete(AFTER);
			if (variableBefore) page.url.searchParams.set(BEFORE, variableBefore);
			shouldNavigate = true;
		}

		if (shouldNavigate) {
			goto(`${page.url.pathname}?${page.url.searchParams.toString()}`);
		}
	});

	// listener for variables changed have been applied on the URL bar
	afterNavigate(async () => {
		scrollTo({ top: 0, behavior: 'smooth' });

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
						newVariables.sortBy = {
							field: queryParams[ORDER_BY_FIELD],
							direction: (queryParams[ORDER_DIRECTION] as OrderDirection) || OrderDirection.Asc,
						};
					}
					continue;
				case ORDER_DIRECTION:
					continue;
				case SEARCH_QUERY:
					if (searchKey) {
						if (queryParams[SEARCH_QUERY]) set(newVariables, searchKey, queryParams[SEARCH_QUERY]);
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
