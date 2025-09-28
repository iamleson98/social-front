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
	import { parseUrlSearchParams, type SearchParamsType } from '$lib/utils/utils';
	import FilterContainer from './filter-container.svelte';
	import type { FilterConditions, FilterProps } from './types';
	import type { AnyVariables } from '@urql/core';
	import { get, set } from 'es-toolkit/compat';
	import { untrack } from 'svelte';

	/**
	 * 1) Each parent components/pages that use this component, should perform setting extra filter fields to the variables themself. Since there is no common pattern for
	 * 		auto update them within this component.
	 */

	type Props = {
		/** if not provided, will not show filter button */
		filterOptions?: FilterProps<T>;
		variables: Var;
		/** if provided, will display the text box for search query input as well */
		searchKey?: keyof Var | string;
		forceReExecuteGraphqlQuery: boolean;
		disabled?: boolean;
		/** the parent component should handle update extra filters setting on the variables, on their own. Don't update pagination fields */
		extraVariablesFiltersPatching?: (variables: Var, searchParams: SearchParamsType) => Var;
	};

	let {
		filterOptions = {},
		variables = $bindable(),
		searchKey,
		forceReExecuteGraphqlQuery = $bindable(false),
		disabled,
		extraVariablesFiltersPatching,
	}: Props = $props();

	let openFilterBox = $state(false);
	let filters = $state.raw({} as FilterConditions<T>);
	let filtersCount = $derived(Object.keys(filters).length);
	let isInitialLoad = $state(true);

	// const FILTER_MAP = filterOptions.reduce(
	// 	(acc, cur) => {
	// 		acc[cur.key] = cur;
	// 		return acc;
	// 	},
	// 	{} as Record<keyof T, FilterProps<T>>,
	// );

	const handleSearchValueChange = async (evt: Event) => {
		const value = (evt.target as HTMLInputElement).value.trim();
		page.url.searchParams.set(SearchParamKey.SEARCH_QUERY, value);

		await goto(`${page.url.pathname}?${page.url.searchParams.toString()}`, { keepFocus: true });
	};

	// 1) When the PAGINATION params (first, last, before, after, order_by_field, order_direction) change, this `$effect` runs, reflect those changes to the address bar.
	// <QueryParamsStore> will also update, and trigger the listener that under this $effect
	$effect(() => {
		// since $effect fires before afterNavigate, we need to skip the first run so the afterNavigate can run first
		if (isInitialLoad) return;

		const { pathname, searchParams } = untrack(() => page.url);

		const pageSortField = searchParams.get(SearchParamKey.ORDER_BY_FIELD);
		const pageSortDirection = searchParams.get(SearchParamKey.ORDER_DIRECTION);
		const variableSortField = variables.sortBy?.field;
		const variableSortDirection = variables.sortBy?.direction;

		let shouldNavigate = false;

		// NOTE: Below we use `!=` instead of `!==` to compare the values here, since there are null and undefined values and the fact that <null == undefined and 3 == '3'> :))

		if (variableSortField != pageSortField || variableSortDirection != pageSortDirection) {
			if (!!variableSortField) searchParams.set(SearchParamKey.ORDER_BY_FIELD, variableSortField);
			else searchParams.delete(SearchParamKey.ORDER_BY_FIELD);

			if (!!variableSortDirection)
				searchParams.set(SearchParamKey.ORDER_DIRECTION, variableSortDirection);
			else searchParams.delete(SearchParamKey.ORDER_DIRECTION);
			shouldNavigate = true;
		}

		const pageFirst = searchParams.get(SearchParamKey.FIRST);
		const pageAfter = searchParams.get(SearchParamKey.AFTER);
		const variableFirst = variables.first;
		const variableAfter = variables.after;

		if (variableFirst != pageFirst || variableAfter != pageAfter) {
			if (!!variableFirst && variableFirst > 0) {
				searchParams.set(SearchParamKey.FIRST, String(variableFirst));
				searchParams.delete(SearchParamKey.LAST);
				searchParams.delete(SearchParamKey.BEFORE);
			}
			if (!!variableAfter) searchParams.set(SearchParamKey.AFTER, variableAfter);
			shouldNavigate = true;
		}

		const variableLast = variables.last;
		const variableBefore = variables.before;
		const pageLast = searchParams.get(SearchParamKey.LAST);
		const pageBefore = searchParams.get(SearchParamKey.BEFORE);

		if (variableLast != pageLast || variableBefore != pageBefore) {
			if (!!variableLast && variableLast > 0) {
				searchParams.set(SearchParamKey.LAST, String(variableLast));
				searchParams.delete(SearchParamKey.FIRST);
				searchParams.delete(SearchParamKey.AFTER);
			}
			if (!!variableBefore) searchParams.set(SearchParamKey.BEFORE, variableBefore);
			shouldNavigate = true;
		}

		if (shouldNavigate) goto(`${pathname}?${searchParams.toString()}`, { replaceState: true });
	});

	/**
	 * 2) - When the nevigation event occurs (pagination, extra filters change, F5 reload page), the `QyeryParamsStore` will also change.
	 * 		We listen on those changes, to update pagination, extra filter fields of the variables.
	 * 		The $effect will run again also, BUT if the pagination params does not differ from of the address bar, it will stop early and not cause infinite running.
	 * 		- Also within this listener, we parse filter state for the filtering button, so the filter panel has the right state to display, even after F5 reload.
	 */
	afterNavigate(async () => {
		const params = parseUrlSearchParams(page.url);
		if (!params || !Object.keys(params).length) {
			isInitialLoad = false;
			return;
		}

		scrollTo({ top: 0, behavior: 'smooth' });

		// which triggers running the $effect above infinitely.
		let newVariables = {} as Var;
		const newFilters = {} as FilterConditions<T>;

		for (const key in params) {
			if (SearchParamKey.FIRST === key) {
				newVariables.first = params[SearchParamKey.FIRST].value as number;
			} else if (SearchParamKey.LAST === key) {
				newVariables.last = params[SearchParamKey.LAST].value as number;
			} else if (SearchParamKey.BEFORE === key) {
				newVariables.before = params[SearchParamKey.BEFORE].value as string;
			} else if (SearchParamKey.AFTER === key) {
				newVariables.after = params[SearchParamKey.AFTER].value as string;
			} else if (SearchParamKey.ORDER_BY_FIELD === key) {
				set(newVariables, 'sortBy.field', params[SearchParamKey.ORDER_BY_FIELD].value as string);
				if (params[SearchParamKey.ORDER_DIRECTION]) {
					set(
						newVariables,
						'sortBy.direction',
						(
							params[SearchParamKey.ORDER_DIRECTION].value as string
						).toUpperCase() as OrderDirection,
					);
				}
			} else if (filterOptions[key as keyof T]) {
				newFilters[key as keyof T] = params[key];
			}
		}

		// perform inner update extra filter state for variables
		if (extraVariablesFiltersPatching) {
			// NOTE: reassign like this prevent the parent unexpectedly update pagination fields
			newVariables = {
				...extraVariablesFiltersPatching({ ...newVariables }, params),
				...newVariables,
			};
		}

		variables = newVariables;
		filters = newFilters;
		forceReExecuteGraphqlQuery = true;
		isInitialLoad = false;
	});
</script>

<div class="flex items-center gap-2">
	{#if Object.keys(filterOptions).length}
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
