<script lang="ts" generics="T, Var extends (AnyVariables & GraphqlPaginationArgs)">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { FilterCog, Search } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import { type DropdownTriggerInterface, Popover } from '$lib/components/ui/Popover';
	import type { GraphqlPaginationArgs } from '$lib/components/ui/Table';
	import { OrderDirection } from '$lib/gql/graphql';
	import { SearchParamKey } from '$lib/utils/consts';
	import { type SearchParamsType } from '$lib/utils/utils';
	import { QyeryParamsStore } from '../query-params-lister.svelte';
	import FilterContainer from './filter-container.svelte';
	import type { FilterConditions, FilterProps } from './types';
	import type { AnyVariables } from '@urql/core';
	import { get } from 'es-toolkit/compat';
	import { onMount } from 'svelte';

	/**
	 * The idea for this search params querying system is:
	 * 
	 * 1) When the pagination params (first, last, before, after) change, the `$effect` below runs, reflect those changes to the address bar
	 * 
	 * 2) - When the nevigation event occurs (pagination, extra filter change, F5 reload page), the `QyeryParamsStore` will also change.
	 * 		We listen on those changes, to update pagination, extra filter fields of the variables.
	 * 		The $effect will run again also, but if the pagination params does not differ from of the address bar, it will stop early and not cause infinite running.
	 * 		- Also within this listener, we parse filter state for the filtering button, so the filter panel has the right state to display, even after F5 reload.
	 * 
	 * 3) Each parent components/pages that use this component, should perform setting extra filter fields to the variables themself. Since there is no common pattern for 
	 * 		auto update them within this component.
	 */

	type Props = {
		/** if not provided, will not show filter button */
		filterOptions?: FilterProps<T>[];
		variables: Var;
		/** if provided, will display the text box for search query input as well */
		searchKey?: keyof Var | string;
		forceReExecuteGraphqlQuery: boolean;
		disabled?: boolean;
		/** the parent component should handle update extra filters setting on the variables, on their own. Don't update pagination fields */
		extraVariablesFiltersPatching?: (variables: Var, searchParams: SearchParamsType) => void;
	};

	let {
		filterOptions = [],
		variables = $bindable(),
		searchKey,
		forceReExecuteGraphqlQuery = $bindable(false),
		disabled,
		extraVariablesFiltersPatching,
	}: Props = $props();

	let openFilterBox = $state(false);
	let filters = $state.raw({} as FilterConditions<T>);
	let filtersCount = $derived(Object.keys(filters).length);

	const FILTER_MAP = filterOptions.reduce(
		(acc, cur) => {
			acc[cur.key] = cur;
			return acc;
		},
		{} as Record<keyof T, FilterProps<T>>,
	);

	const handleSearchValueChange = async (evt: Event) => {
		const value = (evt.target as HTMLInputElement).value.trim();
		page.url.searchParams.set(SearchParamKey.SEARCH_QUERY, value);

		await goto(`${page.url.pathname}?${page.url.searchParams.toString()}`, { keepFocus: true });
	};

	// listener for pagination params only
	$effect(() => {
		console.log('------------------')
		const pageSortField = page.url.searchParams.get(SearchParamKey.ORDER_BY_FIELD);
		const pageSortDirection = page.url.searchParams.get(SearchParamKey.ORDER_DIRECTION);
		const variableSortField = variables.sortBy?.field;
		const variableSortDirection = variables.sortBy?.direction;

		let shouldNavigate = false;

		if (variableSortField !== pageSortField || variableSortDirection !== pageSortDirection) {
			if (!!variableSortField)
				page.url.searchParams.set(SearchParamKey.ORDER_BY_FIELD, variableSortField);
			else page.url.searchParams.delete(SearchParamKey.ORDER_BY_FIELD);

			if (!!variableSortDirection)
				page.url.searchParams.set(SearchParamKey.ORDER_DIRECTION, variableSortDirection);
			else page.url.searchParams.delete(SearchParamKey.ORDER_DIRECTION);

			shouldNavigate = true;
		}

		const pageFirst = page.url.searchParams.get(SearchParamKey.FIRST);
		const pageAfter = page.url.searchParams.get(SearchParamKey.AFTER);
		const variableFirst = variables.first;
		const variableAfter = variables.after;

		if (variableFirst !== pageFirst || variableAfter !== pageAfter) {
			if (!!variableFirst && variableFirst > 0) {
				page.url.searchParams.set(SearchParamKey.FIRST, String(variableFirst));
				page.url.searchParams.delete(SearchParamKey.LAST);
				page.url.searchParams.delete(SearchParamKey.BEFORE);
			}
			if (!!variableAfter) page.url.searchParams.set(SearchParamKey.AFTER, variableAfter);

			shouldNavigate = true;
		}

		const variableLast = variables.last;
		const variableBefore = variables.before;
		const pageLast = page.url.searchParams.get(SearchParamKey.LAST);
		const pageBefore = page.url.searchParams.get(SearchParamKey.BEFORE);

		if (variableLast !== pageLast || variableBefore !== pageBefore) {
			if (!!variableLast && variableLast > 0) {
				page.url.searchParams.set(SearchParamKey.LAST, String(variableLast));
				page.url.searchParams.delete(SearchParamKey.FIRST);
				page.url.searchParams.delete(SearchParamKey.AFTER);
			}
			if (!!variableBefore) page.url.searchParams.set(SearchParamKey.BEFORE, variableBefore);
			shouldNavigate = true;
		}

		if (shouldNavigate) goto(`${page.url.pathname}?${page.url.searchParams.toString()}`);
	});

	// listener for extra filters other than pagination only
	onMount(() =>
		QyeryParamsStore.subscribe((params) => {
			if (!params) return;

			scrollTo({ top: 0, behavior: 'smooth' });

			// delete those fields to prevent the callback `variablePatching` unexpectedly updating those fields of variables.
			// which triggers running the $effect above infinitely.
			const newVariables = { ...variables };
			const newFilters = {} as FilterConditions<T>;

			for (const key in params) {
				if (SearchParamKey.FIRST === key)
					newVariables.first = params[SearchParamKey.FIRST].value as number;
				else if (SearchParamKey.LAST === key)
					newVariables.last = params[SearchParamKey.LAST].value as number;
				else if (SearchParamKey.BEFORE === key)
					newVariables.before = params[SearchParamKey.BEFORE].value as string;
				else if (params[SearchParamKey.AFTER])
					newVariables.after = params[SearchParamKey.AFTER].value as string;
				else if (SearchParamKey.ORDER_BY_FIELD === key && newVariables['sortBy']) {
					newVariables.sortBy.field = params[SearchParamKey.ORDER_BY_FIELD].value as string;
					if (params[SearchParamKey.ORDER_DIRECTION])
						newVariables.sortBy.direction = (
							params[SearchParamKey.ORDER_DIRECTION].value as string
						).toUpperCase() as OrderDirection;
				} else if (FILTER_MAP[key as keyof T]) {
					newFilters[key as keyof T] = params[key];
				}
			}

			// perform inner update extra filter state for variables
			if (extraVariablesFiltersPatching) extraVariablesFiltersPatching(newVariables, params);

			variables = newVariables;
			filters = newFilters;
			forceReExecuteGraphqlQuery = true;
		}),
	);
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
