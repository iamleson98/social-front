<script lang="ts" generics="T">
	import { tranFunc } from '$i18n';
	import { CloseX, Plus, Trash } from '$lib/components/icons';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Select, type Primitive, type SelectOption } from '$lib/components/ui/select';
	import { constructUrlSearchParamsAndNavigate } from '$lib/utils/utils';
	import type { FilterConditions, FilterItemValue, FilterOperator, FilterProps } from './types';
	import { omit } from 'es-toolkit';

	type Props = {
		filterOptions: FilterProps<T>;
		open: boolean;
		filters: FilterConditions<T>;
		disabled?: boolean;
	};

	let { filterOptions = {}, open = $bindable(), filters, disabled }: Props = $props();

	let activeFilters = $state.raw(filters);

	let availableFilters = $derived(
		Object.keys(filterOptions).map<SelectOption>((key) => ({
			value: key as Primitive,
			label: filterOptions[key as keyof T]!.label,
			disabled: !!activeFilters[key as keyof T],
		})),
	);
	let disableAddFilterBtn = $derived(
		Object.entries<
			Partial<{
				operator: FilterOperator;
				value: FilterItemValue;
			}>
		>(activeFilters).some(([key, value]) => !key || !value.operator || value.value === undefined),
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

	const handleFilterItemKeyChange = async (oldKey: keyof T, newKey?: keyof T) => {
		if (!newKey || oldKey === newKey) return;

		const newFilters = { ...activeFilters };
		delete newFilters[oldKey];

		newFilters[newKey] = {};

		const pairWith = filterOptions[newKey]?.mustPairWith;

		if (pairWith && !activeFilters[pairWith] && filterOptions[pairWith]) {
			newFilters[pairWith] = {};
		}

		activeFilters = newFilters;
	};

	const handleApplyCustomFilter = async () => {
		open = false;
		await constructUrlSearchParamsAndNavigate(activeFilters);
	};
</script>

<div class="bg-white rounded-lg p-2 shadow-md border border-gray-200 min-w-110">
	<dir class="flex items-center justify-between">
		<span class="text-sm font-medium">{$tranFunc('common.filter')}</span>
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
				{@const disableDeleleButton = Object.keys(activeFilters).some(
					(item) => filterOptions[item as keyof T]?.mustPairWith === key,
				)}
				<div class="flex items-center gap-1 mt-1.5 justify-between">
					<Select
						options={availableFilters}
						size="xs"
						class="flex-2"
						value={key}
						onchange={(vl) =>
							handleFilterItemKeyChange(key as keyof T, (vl as SelectOption)?.value as keyof T)}
						placeholder={$tranFunc('common.selectFilter')}
						disabled={disableDeleleButton || disabled}
					/>

					<div class="flex-4 flex items-center gap-1">
						{#if key && filterOpt}
							{@const operatorOptions = Object.keys(
								filterOptions[key as keyof T]?.operations || {},
							).map<SelectOption>((operator) => ({
								label: $tranFunc(`common.${operator}`),
								value: operator,
							}))}

							<Select
								options={operatorOptions}
								size="xs"
								class="flex-1"
								value={filterOpt.operator}
								{disabled}
								onchange={(vl) => {
									setFilterItemValue(key as keyof T, (vl as SelectOption)?.value as FilterOperator);
								}}
							/>
							{#if filterOpt.operator}
								<div class="flex-1">
									{@render filterOptions[key as keyof T]?.operations[filterOpt.operator]?.({
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
							aria-label={$tranFunc('common.delFilter')}
							disabled={disableDeleleButton || disabled}
						/>
					</div>
				</div>
			{/each}
		{:else}
			<div class="flex items-center justify-center text-sm text-gray-500">
				<span>{$tranFunc('common.addFilter')}</span>
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
				{$tranFunc('common.addFilter')}
			</Button>
			<div class="gap-1">
				<Button
					size="xs"
					variant="light"
					color="gray"
					onclick={() => (activeFilters = {} as FilterConditions<T>)}
					{disabled}
				>
					{$tranFunc('common.reset')}
				</Button>
				<Button
					size="xs"
					disabled={disableAddFilterBtn || disabled}
					onclick={handleApplyCustomFilter}
				>
					{$tranFunc('btn.apply')}
				</Button>
			</div>
		</div>
	</div>
</div>
