<script lang="ts" generics="T">
	import { CloseX, Plus, Trash } from '$lib/components/icons';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { type SelectOption } from '$lib/components/ui/select';
	import Select from '$lib/components/ui/select/select.svelte';
	import type { FilterConditions, FilterItemValue, FilterOperator, FilterProps } from './types';
	import { SvelteMap } from 'svelte/reactivity';

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

	let activeFilters = $state<FilterConditions<T>>(new SvelteMap(filters));

	let availableFilters = $derived.by(() => {
		const usedFilterMap: Partial<Record<keyof T, boolean>> = {};

		for (const key of activeFilters.keys()) {
			const filterOpt = activeFilters.get(key);
			if (filterOpt && filterOpt.operator && filterOpt.value !== undefined) {
				usedFilterMap[key] = true;
			}
		}

		return options.map(({ key, label }) => ({
			value: key as string | number,
			label,
			disabled: usedFilterMap[key],
		}));
	});

	let disableAddFilterBtn = $derived(
		activeFilters
			.entries()
			.some(([key, value]) => !key || !value.operator || value.value === undefined),
	);

	const onClickAddFilter = () => {
		activeFilters.set('' as keyof T, {});
	};

	const handleDeleteFilter = (key: keyof T) => {
		activeFilters.delete(key);
	};

	const handleApplyClick = () => {
		onApply(activeFilters);
	};

	const handleItemKeyChange = (oldKey: keyof T, newKey?: keyof T) => {
		if (oldKey === newKey) return;

		if (newKey) {
			activeFilters.set(newKey, {});

			// check if this filter requires another filter
			if (FILTER_MAP[newKey].mustPairWith) {
				const { mustPairWith } = FILTER_MAP[newKey];
				if (!activeFilters.has(mustPairWith) && FILTER_MAP[mustPairWith]) {
					activeFilters.set(mustPairWith, {});
				}
			}
		}
		activeFilters.delete(oldKey);
	};

	const setFilterItemValue = (key: keyof T, operator: FilterOperator, value?: FilterItemValue) => {
		activeFilters.set(key, {
			operator,
			value,
		});
	};
</script>

<div class="{className} bg-white rounded-lg p-2 shadow-md border border-gray-200">
	<dir class="flex items-center justify-between">
		<span class="text-sm font-medium">{header}</span>
		<IconButton icon={CloseX} color="gray" size="xs" variant="light" onclick={onClose} />
	</dir>

	<div class="p-2">
		{#if activeFilters.size}
			{#each activeFilters.keys() as key, idx (idx)}
				{@const filterOpt = activeFilters.get(key)}
				{@const disableDelBtn = options.some(
					(opt) => opt.mustPairWith === key && activeFilters.has(opt.key),
				)}
				<div class="flex items-center gap-1 mt-1.5 justify-between">
					<Select
						options={availableFilters}
						size="xs"
						class="flex-2"
						value={key as string}
						onchange={(vl) => vl && handleItemKeyChange(key, (vl as SelectOption).value as keyof T)}
						placeholder="Select filter"
					/>

					<div class="flex-4 flex items-center gap-1">
						{#if key && filterOpt}
							{@const { operations } = FILTER_MAP[key]}
							{@const operatorOpts = operations.map(({ operator }) => ({
								label: operator,
								value: operator,
							}))}

							<Select
								options={operatorOpts}
								size="xs"
								class="flex-1"
								value={filterOpt.operator}
								onchange={(vl) =>
									vl && setFilterItemValue(key, (vl as SelectOption).value as FilterOperator)}
							/>
							{#if filterOpt.operator}
								{@const component = operations.find(
									({ operator }) => operator === filterOpt.operator,
								)?.component}
								<div class="flex-1">
									{@render component?.({
										onValue: (value) =>
											setFilterItemValue(key, filterOpt.operator as FilterOperator, value),
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
							onclick={() => handleDeleteFilter(key)}
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
				<Button
					size="xs"
					variant="light"
					color="gray"
					onclick={() => (activeFilters = new SvelteMap())}>Reset</Button
				>
				<Button size="xs" disabled={disableAddFilterBtn} onclick={handleApplyClick}>Apply</Button>
			</div>
		</div>
	</div>
</div>
