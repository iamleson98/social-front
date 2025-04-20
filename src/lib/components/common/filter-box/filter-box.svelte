<script lang="ts">
	import { CloseX, Plus, Trash } from '$lib/components/icons';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import Select from '$lib/components/ui/select/select.svelte';
	import type { FilterOperator, FilterProps } from './types';
	import type { SelectOption } from '$lib/components/ui/select';

	type Props = {
		options: FilterProps[];
		header?: string;
		onClose?: () => void;
		class?: string;
	};

	let { options, header, onClose, class: className = '' }: Props = $props();

	type SingleFilter = {
		key: string;
		operator: FilterOperator;
		value?: string[] | number[] | string | number;
	};

	let activeFilters = $state<Partial<SingleFilter>[]>([]);
	let availableFilters = $derived.by(() => {
		const usedFilterMap: Record<string, boolean> = {};
		for (const { key, operator, value } of activeFilters) {
			if (key && operator && value !== undefined) {
				usedFilterMap[key] = true;
			}
		}

		const result: SelectOption[] = [];
		for (const { key, label } of options) {
			if (!usedFilterMap[key]) {
				result.push({ label, value: key });
			}
		}

		return result;
	});

	let disableAddFilterBtn = $derived(
		activeFilters.some((filter) => !filter.key || !filter.operator)
	);

	const onClickAddFilter = () => {
		activeFilters = activeFilters.concat({}); // empty to display select box
	};

	const handleDeleteFilter = (index: number) => {
		activeFilters = activeFilters.filter((_, idx) => idx !== index);
	};
</script>

<div class="{className} bg-white rounded-lg p-2 shadow-md">
	<dir class="flex items-center justify-between">
		<span class="text-sm font-medium">{header}</span>
		<IconButton icon={CloseX} color="gray" size="xs" variant="light" onclick={onClose} />
	</dir>

	<div class="p-2">
		{#if activeFilters.length}
			{#each activeFilters as filter, idx (idx)}
				<div class="flex items-center gap-1 mt-1.5 justify-between">
					<Select
						options={availableFilters}
						size="xs"
						class="w-[30%]!"
						bind:value={filter.key}
						placeholder="Select filter"
					/>

					<div class="w-[60%] flex items-center gap-1">
						{#if filter.key}
							{@const operations = options.find(({ key }) => key === filter.key)?.operation ?? []}
							{@const operatorOpts = operations.map(({ operator }) => ({
								label: operator,
								value: operator
							}))}

							<Select
								options={operatorOpts}
								size="xs"
								class="w-[49.5%]!"
								bind:value={filter.operator}
							/>
							{#if filter.operator}
								{@const component = operations.find(
									({ operator }) => operator === filter.operator
								)?.component}
								<div class="w-[49.5%]">
									{@render component?.({
										onValue: (vl) => (filter.value = vl)
									})}
								</div>
							{/if}
						{/if}
					</div>

					<div class="w-[10%] text-right">
						<IconButton
							icon={Trash}
							rounded
							size="xs"
							variant="light"
							color="red"
							onclick={() => handleDeleteFilter(idx)}
							aria-label="Delete filter"
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
				<Button size="xs" variant="light" color="gray">Reset</Button>
				<Button size="xs" disabled={disableAddFilterBtn}>Apply</Button>
			</div>
		</div>
	</div>
</div>
