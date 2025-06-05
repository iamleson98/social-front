<script lang="ts" generics="T, Var extends AnyVariables & GraphqlPaginationArgs">
	import type { GraphqlPaginationArgs } from '$lib/components/ui/Table';
	import type { AnyVariables } from '@urql/core';
	import type { FilterConditions, FilterItemValue, FilterOperator, FilterProps } from './types';
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
	import { CloseX, FilterCog, Plus, Search, Trash } from '$lib/components/icons';
	import { omit } from 'es-toolkit';
	import { Select, type Primitive, type SelectOption } from '$lib/components/ui/select';
	import { IconButton } from '$lib/components/ui/Button';

	type Props = {
		/** if not provided, will not show filter button */
		filterOptions: FilterProps<T>[];
		variables: Var;
		/** if provided, will display the text box for search query input as well */
		searchKey?: keyof Var;
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
			`invalid key provided "${String(searchKey)}" or you forget to initialize the path "${String(searchKey)}"" for your variable?`,
		);

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

	let availableFilters = $derived.by(() =>
		filterOptions.map<SelectOption>(({ key, label }) => ({
			value: key as Primitive,
			label,
			disabled: !!filters[key],
		})),
	);

	let disableAddFilterBtn = $derived(
		Object.entries<
			Partial<{
				operator: FilterOperator;
				value: FilterItemValue;
			}>
		>(filters).some(([key, value]) => !key || !value.operator || value.value === undefined),
	);

	const handleFilterItemKeyChange = async (oldKey: keyof T, newKey?: keyof T) => {
		if (oldKey === newKey) return;

		const newFilters = { ...filters };
		delete newFilters[oldKey];

		if (newKey) {
			newFilters[newKey] = {};

			if (FILTER_MAP[newKey].mustPairWith && !filters[FILTER_MAP[newKey].mustPairWith]) {
				const { mustPairWith } = FILTER_MAP[newKey];

				if (FILTER_MAP[mustPairWith]) {
					newFilters[mustPairWith] = {};
				}
			}
		}

		filters = newFilters;
	};

	const setFilterItemValue = (key: keyof T, operator?: FilterOperator, value?: FilterItemValue) => {
		filters = {
			...filters,
			[key]: operator
				? {
						operator,
						value,
					}
				: {},
		};
	};

	const handleSearchValueChange = (evt: Event) => {
		if (!searchKey) return;

		const newVariables = { ...variables };
		set(newVariables, searchKey, (evt.target as HTMLInputElement).value.trim());
		variables = newVariables;
	};

	const handlePaginationNavigation = async () => {
		const params = page.url.searchParams;
		const oldSearchParams = new URLSearchParams(params);

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
			hasSomethingChanged ||= oldSearchParams.get(key) != value;
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
						set(newVariables, searchKey, queryParams[SEARCH_QUERY]);
					}
					continue;

				default:
					// all the custom filter cases:
					if (!FILTER_MAP[key as keyof T]) continue;

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
		variables = newVariables;
	});

	const handleApplyCustomFilter = async () => {
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
	{#if filterOptions.length}
		{#snippet trigger(opts: DropdownTriggerInterface)}
			<Button variant="outline" size="sm" {...opts} class="indicator" endIcon={FilterCog}>
				{#if filtersCount}
					<span class="indicator-item badge badge-xs text-white! bg-blue-500">{filtersCount}</span>
				{/if}
				Filters
			</Button>
		{/snippet}

		<Popover {trigger} placement="bottom-start" bind:open={openFilterBox}>
			<div class="bg-white rounded-lg p-2 shadow-md border border-gray-200 min-w-110">
				<dir class="flex items-center justify-between">
					<span class="text-sm font-medium">Filters</span>
					<IconButton
						icon={CloseX}
						color="gray"
						size="xs"
						variant="light"
						onclick={() => (openFilterBox = false)}
					/>
				</dir>

				<div class="p-2">
					{#if Object.keys(filters).length}
						{#each Object.keys(filters) as key, idx (idx)}
							{@const filterOpt = filters[key as keyof T]}
							{@const disableDelBtn = filterOptions.some(
								// if this filter is additional requirement to make a pair with another filter, then its delete button must be disabled
								(opt) => opt.mustPairWith === key && filters[opt.key],
							)}
							<div class="flex items-center gap-1 mt-1.5 justify-between">
								<Select
									options={availableFilters}
									size="xs"
									class="flex-2"
									value={key}
									onchange={(vl) =>
										handleFilterItemKeyChange(
											key as keyof T,
											(vl as SelectOption)?.value as keyof T,
										)}
									placeholder="Select filter"
									disabled={disableDelBtn}
								/>

								<div class="flex-4 flex items-center gap-1">
									{#if key && filterOpt}
										{@const { operations } = FILTER_MAP[key as keyof T]}
										{@const operatorOpts = operations.map(({ operator }) => ({
											label: operator,
											value: operator,
										}))}

										<Select
											options={operatorOpts}
											size="xs"
											class="flex-1"
											value={filterOpt.operator}
											onchange={(vl) => {
												setFilterItemValue(
													key as keyof T,
													(vl as SelectOption)?.value as FilterOperator,
												);
											}}
										/>
										{#if filterOpt.operator}
											{@const { component } = operations.find(
												({ operator }) => operator === filterOpt.operator,
											)!}
											<div class="flex-1">
												{@render component({
													onValue: (value) => {
														setFilterItemValue(
															key as keyof T,
															filterOpt.operator as FilterOperator,
															value,
														);
													},
													initialValue: filterOpt.value,
												})}
											</div>
										{/if}
									{/if}
								</div>

								<div class="flex-1 text-right">
									<IconButton
										icon={Trash}
										rounded
										size="xs"
										variant="light"
										color="red"
										onclick={() =>
											(filters = omit(filters, [key as keyof T]) as FilterConditions<T>)}
										aria-label="Delete filter"
										disabled={disableDelBtn}
									/>
								</div>
							</div>
						{/each}
					{:else}
						<div class="flex items-center justify-center text-sm text-gray-500">
							<span>Add filter</span>
						</div>
					{/if}
				</div>

				<div>
					<div class="border-t border-gray-200"></div>
					<div class="flex items-center justify-between mt-2">
						<Button
							startIcon={Plus}
							size="xs"
							variant="light"
							color="gray"
							onclick={() => (filters = { ...filters, '': {} })}
							disabled={disableAddFilterBtn}
						>
							Add Filter
						</Button>
						<div class="gap-1">
							<Button
								size="xs"
								variant="light"
								color="gray"
								onclick={() => (filters = {} as FilterConditions<T>)}
							>
								Reset
							</Button>
							<Button size="xs" disabled={disableAddFilterBtn} onclick={handleApplyCustomFilter}>
								Apply
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Popover>
	{/if}
	{#if searchKey}
		<Input
			placeholder="Enter your query"
			size="sm"
			value={get(variables, searchKey)}
			inputDebounceOption={{ onInput: handleSearchValueChange, debounceTime: 888 }}
			startIcon={Search}
		/>
	{/if}
</div>
