<script lang="ts" generics="T">
	import { CloseX, Plus, Trash } from '$lib/components/icons';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import type { FilterConditions, FilterItemValue, FilterOperator, FilterProps } from './types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Select, type Primitive, type SelectOption } from '$lib/components/ui/select';
	import { omit } from 'es-toolkit';

	type Props = {
		filterOptions: FilterProps<T>[];
		open: boolean;
		filters: FilterConditions<T>;
		disabled?: boolean;
	};

	let { filterOptions, open = $bindable(), filters, disabled }: Props = $props();

	const FILTER_MAP = filterOptions.reduce(
		(acc, cur) => {
			acc[cur.key] = cur;
			return acc;
		},
		{} as Record<keyof T, FilterProps<T>>,
	);

	let activeFilters = $state.raw(filters);

	let availableFilters = $derived.by(() =>
		filterOptions.map<SelectOption>(({ key, label }) => ({
			value: key as Primitive,
			label,
			disabled: !!activeFilters[key],
		})),
	);

	const setFilterItemValue = (key: keyof T, operator?: FilterOperator, value?: FilterItemValue) => {
		activeFilters = {
			...activeFilters,
			[key]: operator
				? {
						operator,
						value,
					}
				: {},
		};
	};

	let disableAddFilterBtn = $derived(
		Object.entries<
			Partial<{
				operator: FilterOperator;
				value: FilterItemValue;
			}>
		>(activeFilters).some(([key, value]) => !key || !value.operator || value.value === undefined),
	);

	const handleFilterItemKeyChange = async (oldKey: keyof T, newKey?: keyof T) => {
		if (!newKey || oldKey === newKey) return;

		const newFilters = { ...activeFilters };
		delete newFilters[oldKey];

		newFilters[newKey] = {};

		const pairWith = FILTER_MAP[newKey].mustPairWith;

		if (pairWith && !activeFilters[pairWith] && FILTER_MAP[pairWith]) {
			newFilters[pairWith] = {};
		}

		activeFilters = newFilters;
	};

	const handleApplyCustomFilter = async () => {
		const keys = Object.keys(activeFilters);
		if (!keys.length) return;

		const params = page.url.searchParams; // add filter conditions to existing params

		for (const key of keys) {
			const filterOpt = activeFilters[key as keyof T];
			if (!filterOpt) continue;

			if (filterOpt.operator === 'lte') {
				params.set(key, `<null,${filterOpt.value}>`);
			} else if (filterOpt.operator === 'gte') {
				params.set(key, `<${filterOpt.value},null>`);
			} else if (filterOpt.operator === 'oneOf') {
				params.set(key, JSON.stringify(filterOpt.value));
			} else if (filterOpt.operator === 'range' && Array.isArray(filterOpt.value)) {
				params.set(key, `<${filterOpt.value[0]},${filterOpt.value[1]}>`);
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

		open = false; //

		await goto(`${page.url.pathname}?${params.toString()}`);
	};

	// $inspect(activeFilters, filters);
</script>

<div class="bg-white rounded-lg p-2 shadow-md border border-gray-200 min-w-110">
	<dir class="flex items-center justify-between">
		<span class="text-sm font-medium">Filters</span>
		<IconButton
			{disabled}
			icon={CloseX}
			color="gray"
			size="xs"
			variant="light"
			onclick={() => (open = false)}
		/>
	</dir>

	<div class="p-2">
		{#if Object.keys(activeFilters).length}
			{#each Object.keys(activeFilters) as key, idx (idx)}
				{@const filterOpt = activeFilters[key as keyof T]}
				{@const disableDelBtn = filterOptions.some(
					// if this filter is additional requirement to make a pair with another filter, then its delete button must be disabled
					(opt) => opt.mustPairWith === key && activeFilters[opt.key],
				)}
				<div class="flex items-center gap-1 mt-1.5 justify-between">
					<Select
						options={availableFilters}
						size="xs"
						class="flex-2"
						value={key}
						onchange={(vl) =>
							handleFilterItemKeyChange(key as keyof T, (vl as SelectOption)?.value as keyof T)}
						placeholder="Select filter"
						disabled={disableDelBtn || disabled}
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
								{disabled}
								onchange={(vl) => {
									setFilterItemValue(key as keyof T, (vl as SelectOption)?.value as FilterOperator);
								}}
							/>
							{#if filterOpt.operator}
								{@const component = operations.find(
									({ operator }) => operator === filterOpt.operator,
								)?.component}
								<div class="flex-1">
									{@render component?.({
										onValue: (value) => {
											setFilterItemValue(key as keyof T, filterOpt.operator, value);
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
								(activeFilters = omit(activeFilters, [key as keyof T]) as FilterConditions<T>)}
							aria-label="Delete filter"
							disabled={disableDelBtn || disabled}
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

	<div class="border-t border-gray-200">
		<div class="flex items-center justify-between mt-2">
			<Button
				startIcon={Plus}
				size="xs"
				variant="light"
				color="gray"
				onclick={() => (activeFilters = { ...activeFilters, '': {} })}
				disabled={disableAddFilterBtn || disabled}
			>
				Add Filter
			</Button>
			<div class="gap-1">
				<Button
					size="xs"
					variant="light"
					color="gray"
					onclick={() => (activeFilters = {} as FilterConditions<T>)}
					{disabled}
				>
					Reset
				</Button>
				<Button
					size="xs"
					disabled={disableAddFilterBtn || disabled}
					onclick={handleApplyCustomFilter}
				>
					Apply
				</Button>
			</div>
		</div>
	</div>
</div>
