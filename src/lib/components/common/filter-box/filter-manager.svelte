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
	import { parseUrlSearchParams } from '$lib/utils/utils';
	import { type DropdownTriggerInterface, Popover } from '$lib/components/ui/Popover';
	import { Button } from '$lib/components/ui';
	import FilterBox from './filter-box.svelte';
	import { FilterCog } from '$lib/components/icons';

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

	/**
	 * regex for range like: [<gte>,null], [nul,<lte>] or [<gte>,<lte>]
	 */
	const FILTER_RANGE_REGEX = /^\[([\w\d\.-]+)\,([\w\d\.-]+)\]$/;
	/**
	 * regex for `key-value` pair equality: {<key>,<value>}
	 */
	const FILTER_KEYS_MAP = filterOptions.reduce(
		(acc, { key }) => {
			acc[key] = true;
			return acc;
		},
		{} as Record<keyof T, boolean>,
	);

	let isFilterOpening = $state(false);
	let filters = $state<FilterConditions<T>>({} as FilterConditions<T>);
	let filtersCount = $derived(Object.keys(filters).length);

	const onInput = (evt: Event) => {
		if (!searchKey) return;

		const newVariables = { ...variables };
		set(newVariables, searchKey, (evt.target as HTMLInputElement).value.trim());
		variables = newVariables;
	};

	const handleNavigate = async () => {
		const params = new URLSearchParams();

		if (variables.first) {
			params.append(FIRST, variables.first.toString());

			if (variables.after) {
				params.append(AFTER, variables.after);
			}
		} else if (variables.last) {
			params.append(LAST, variables.last.toString());

			if (variables.before) {
				params.append(BEFORE, variables.before);
			}
		}

		// sorting
		if (variables.sortBy?.field) {
			params.append(ORDER_BY_FIELD, variables.sortBy.field);
			const direction = variables.sortBy.direction || OrderDirection.Asc; // if not set, default to ascending;
			params.append(ORDER_DIRECTION, direction);
		}

		// check for search query string change
		if (searchKey) {
			const query = get(variables, searchKey);
			if (query) params.append(SEARCH_QUERY, query);
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
		handleNavigate();
	});

	// listener for variables changed have been applied on the URL bar
	afterNavigate(async () => {
		scrollTo({ top: 0, behavior: 'smooth' });

		const queryParams = parseUrlSearchParams(page.url);
		const newVariables = { ...variables };

		if (typeof queryParams[FIRST] === 'number') {
			newVariables.first = queryParams[FIRST];
			newVariables.last = null;
			newVariables.before = null;

			if (typeof queryParams[AFTER] === 'string') {
				newVariables.after = queryParams[AFTER];
			}
		} else if (typeof queryParams[LAST] === 'number') {
			newVariables.last = queryParams[LAST];
			newVariables.first = null;
			newVariables.after = null;

			if (typeof queryParams[BEFORE] === 'string') {
				newVariables.before = queryParams[BEFORE];
			}
		}

		// sorting by
		if (typeof queryParams[ORDER_BY_FIELD] === 'string') {
			const direction = (queryParams[ORDER_DIRECTION] as OrderDirection) || OrderDirection.Asc;

			newVariables.sortBy = {
				field: queryParams[ORDER_BY_FIELD],
				direction,
			};
		}

		// if search query
		if (searchKey && queryParams[SEARCH_QUERY]) {
			set(newVariables, searchKey, queryParams[SEARCH_QUERY]);
		}

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

	const onApply = async (filters: FilterConditions<T>) => {
		const keys = Object.keys(filters);
		if (!keys.length) return;

		const params = page.url.searchParams; // add filter conditions to existing params

		for (const key of keys) {
			const filterOpt = filters[key as keyof T];
			if (!filterOpt) continue;

			if (filterOpt.operator === 'lte') {
				params.append(key as string, `[null,${filterOpt.value}]`);
			} else if (filterOpt.operator === 'gte') {
				params.append(key as string, `[${filterOpt.value},null]`);
			} else if (filterOpt.operator === 'oneOf') {
				params.append(key as string, `[${filterOpt.value}]`);
			} else if (filterOpt.operator === 'range' && Array.isArray(filterOpt.value)) {
				params.append(key as string, `[${filterOpt.value[0]},${filterOpt.value[1]}]`);
			} else if (filterOpt.operator === 'eq') {
				/**
				 * There are a few cases for `eq` operator:
				 * 1) equal to primitives, E.g: slug='hello-world';
				 * 2) equal to a pair of `key-value` record,
				 */
				params.append(key as string, filterOpt.value as string);
			}
		}

		isFilterOpening = false;

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

	<Popover {trigger} placement="bottom-start" bind:open={isFilterOpening}>
		<FilterBox
			header="Filters"
			options={filterOptions}
			{onApply}
			{filters}
			class="min-w-96"
			onClose={() => (isFilterOpening = false)}
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
