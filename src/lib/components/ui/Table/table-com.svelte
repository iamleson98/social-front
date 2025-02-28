<script lang="ts" generics="T extends Record<string, unknown>">
	import { tranFunc } from '$i18n';
	import { ChevronLeft, ChevronRight, Icon } from '$lib/components/icons';
	import { IconButton } from '../Button';
	import Button from '../Button/Button.svelte';
	import { DropDown, type DropdownTriggerInterface } from '../Dropdown';
	import MenuItem from '../Menu/menuItem.svelte';
	import type { TableProps } from './types';

	const ROW_OPTIONS = [10, 20, 30, 50, 100];

	let {
		items,
		columns,
		tableClass = '',
		pagination,
		onNextPagelick,
		onPreviousPagelick,
		rowsOptions = ROW_OPTIONS,
		onChangeRowsPerPage
	}: TableProps<T> = $props();

	let rowsPerPage = $state<number>(rowsOptions[0]);

	$effect(() => {
		if (typeof rowsPerPage === 'number') onChangeRowsPerPage?.(rowsPerPage);
	});

	const handleNavigateClick = (dir: 1 | -1) => {
		if (!pagination) return;
		if (dir === -1 && pagination.startCursor) onPreviousPagelick?.(pagination.startCursor);
		if (dir === 1 && pagination.endCursor) onNextPagelick?.(pagination.endCursor);
	};
</script>

<table class="table {tableClass}">
	<thead>
		<tr>
			{#each columns as column, idx (idx)}
				<th>
					<div class="flex items-center gap-2">
						{#if column.startIcon}
							<Icon icon={column.startIcon} />
						{/if}
						<span>{column.title}</span>
						{#if column.endIcon}
							<Icon icon={column.endIcon} />
						{/if}
					</div>
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each items as item, idx (idx)}
			<tr>
				{#each columns as column, idx (idx)}
					{@const data = column.getter(item)}
					<td>
						<div>
							{@html data}
						</div>
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<!-- MARK: pagination -->
{#if pagination}
	<div class="mt-4 flex items-center justify-between">
		<div>
			{#snippet trigger({ onclick, onfocus }: DropdownTriggerInterface)}
				<Button size="xs" variant="light" {onclick} {onfocus}>No. of row {rowsPerPage}</Button>
			{/snippet}
			<DropDown {trigger} placement="bottom-start">
				{#each rowsOptions as option, idx (idx)}
					<MenuItem onclick={() => (rowsPerPage = option)}>{option}</MenuItem>
				{/each}
			</DropDown>
		</div>
		<div class="flex items-center gap-2 justify-end">
			<IconButton
				icon={ChevronLeft}
				size="xs"
				disabled={!pagination.hasPreviousPage}
				aria-label="Previous page"
				class="tooltip tooltip-top"
				data-tip={$tranFunc('common.prevPage')}
				color="gray"
				variant="light"
				onclick={() => handleNavigateClick(-1)}
			/>
			<IconButton
				icon={ChevronRight}
				size="xs"
				disabled={!pagination.hasNextPage}
				aria-label="Next page"
				class="tooltip tooltip-top"
				data-tip={$tranFunc('common.nextPage')}
				color="gray"
				variant="light"
				onclick={() => handleNavigateClick(1)}
			/>
		</div>
	</div>
{/if}
