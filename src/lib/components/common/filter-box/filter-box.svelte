<script lang="ts" generics="T">
	import { CloseX, Plus, Trash } from '$lib/components/icons';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Select, type Primitive, type SelectOption } from '$lib/components/ui/select';
	import type { FilterConditions, FilterItemValue, FilterOperator, FilterProps } from './types';
	import { omit } from 'es-toolkit';

	type Props = {
		options: FilterProps<T>[];
		header?: string;
		onClose?: () => void;
		class?: string;
		filters: FilterConditions<T>;
		onApply: (filters: FilterConditions<T>) => void;
	};

	let { options, header, onClose, class: className = '', filters, onApply }: Props = $props();

	const FILTER_MAP = options.reduce(
		(acc, cur) => {
			acc[cur.key] = cur;
			return acc;
		},
		{} as Record<keyof T, FilterProps<T>>,
	);

	let activeFilters = $state.raw<FilterConditions<T>>(filters);

	let availableFilters = $derived.by(() =>
		options.map<SelectOption>(({ key, label }) => ({
			value: key as Primitive,
			label,
			disabled: !!activeFilters[key],
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

	const onClickAddFilter = () => {
		activeFilters = { ...activeFilters, '': {} };
	};

	const handleDeleteFilter = (key: keyof T) => {
		activeFilters = omit(activeFilters, [key]) as FilterConditions<T>;
	};

	const handleApplyClick = () => {
		onApply(activeFilters);
	};

	const handleResetClick = () => {
		activeFilters = {} as FilterConditions<T>;
		handleApplyClick();
	};

	const handleItemKeyChange = async (oldKey: keyof T, newKey?: keyof T) => {
		if (oldKey === newKey) return;

		const newFilters = { ...activeFilters };
		delete newFilters[oldKey];

		if (newKey) {
			newFilters[newKey] = {};

			if (FILTER_MAP[newKey].mustPairWith && !activeFilters[FILTER_MAP[newKey].mustPairWith]) {
				const { mustPairWith } = FILTER_MAP[newKey];

				if (FILTER_MAP[mustPairWith]) {
					newFilters[mustPairWith] = {};
				}
			}
		}

		activeFilters = newFilters;
	};

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
</script>

<div class="{className} bg-white rounded-lg p-2 shadow-md border border-gray-200">
	<dir class="flex items-center justify-between">
		<span class="text-sm font-medium">{header}</span>
		<IconButton icon={CloseX} color="gray" size="xs" variant="light" onclick={onClose} />
	</dir>

	<div class="p-2">
		{#if Object.keys(activeFilters).length}
			{#each Object.keys(activeFilters) as key, idx (idx)}
				{@const filterOpt = activeFilters[key as keyof T]}
				{@const disableDelBtn = options.some(
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
							handleItemKeyChange(key as keyof T, (vl as SelectOption)?.value as keyof T)}
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
									setFilterItemValue(key as keyof T, (vl as SelectOption)?.value as FilterOperator);
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
							onclick={() => handleDeleteFilter(key as keyof T)}
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
				onclick={onClickAddFilter}
				disabled={disableAddFilterBtn}
			>
				Add Filter
			</Button>
			<div class="gap-1">
				<Button size="xs" variant="light" color="gray" onclick={handleResetClick}>Reset</Button>
				<Button size="xs" disabled={disableAddFilterBtn} onclick={handleApplyClick}>Apply</Button>
			</div>
		</div>
	</div>
</div>
