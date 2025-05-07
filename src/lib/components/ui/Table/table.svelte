<script lang="ts" generics="T extends Record<string, unknown>, K extends string">
	import { tranFunc } from '$i18n';
	import { ArrowsMove, ChevronLeft, ChevronRight, Icon } from '$lib/components/icons';
	import { OrderDirection } from '$lib/gql/graphql';
	import { IconButton } from '../Button';
	import Button from '../Button/Button.svelte';
	import { DropDown, type MenuItemProps } from '../Dropdown';
	import {
		ROW_OPTIONS,
		SortIconsMap,
		type RowOptions,
		type SortState,
		type TableColumnProps,
		type TableProps
	} from './types';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	let {
		items,
		columns,
		tableClass = '',
		pagination,
		onNextPagelick,
		onPreviousPagelick,
		onChangeRowsPerPage,
		onSortChange,
		rowsPerPage,
		sortMultiple = false,
		defaultSortState = {} as SortState<K>,
		disabled = false,
		supportDragDrop = false
	}: TableProps<T, K> = $props();

	if (columns.some((col) => col.sortable && !col.key)) {
		throw new Error('All sortable columns must have an unique key');
	}

	const DEFAULT_SORT_STATE = columns.reduce<SortState<K>>((acc, column) => {
		if (column.sortable) return { ...acc, [column.key!]: 'NEUTRAL' };
		return acc;
	}, {} as SortState<K>);
	let innerRowsPerPage = $state<number>(rowsPerPage || ROW_OPTIONS[0]);
	let sortState = $state.raw<SortState<K>>({ ...DEFAULT_SORT_STATE, ...defaultSortState });

	const handleNavigateClick = (dir: 1 | -1) => {
		if (!pagination) return;
		if (dir === -1 && pagination.startCursor) onPreviousPagelick?.(pagination.startCursor);
		else if (dir === 1 && pagination.endCursor) onNextPagelick?.(pagination.endCursor);
	};

	const handleSortClick = (columnKey: K) => {
		const colSortState: SortState<K> = {} as SortState<K>;
		if (sortState[columnKey] === 'NEUTRAL') {
			colSortState[columnKey] = OrderDirection.Asc;
		} else if (sortState[columnKey] === OrderDirection.Asc) {
			colSortState[columnKey] = OrderDirection.Desc;
		} else {
			colSortState[columnKey] = 'NEUTRAL';
		}
		if (sortMultiple) {
			sortState = { ...sortState, ...colSortState };
			onSortChange?.(sortState);
		} else {
			sortState = { ...DEFAULT_SORT_STATE, ...colSortState };
			onSortChange?.(colSortState);
		}
	};

	const handleRowsPerPageChange = (num: RowOptions) => {
		if (num !== innerRowsPerPage) {
			innerRowsPerPage = num;
			onChangeRowsPerPage?.(num);
		}
	};

	const handleDrop = (state: DragDropState<number>) => {
		const { draggedItem, targetContainer } = state;
		const dropIndex = parseInt(targetContainer ?? '0');
		console.log(dropIndex, draggedItem);
	};
</script>

<table class="table {tableClass}">
	<thead>
		<tr>
			{#if supportDragDrop}
				<th class="w-8"></th>
			{/if}
			{#each columns as column, idx (idx)}
				{@const classes = column?.sortable
					? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200 focus:bg-gray-200'
					: ''}
				{@const props = column?.sortable
					? {
							onclick: () => handleSortClick(column.key!),
							onkeyup: (evt: KeyboardEvent) => evt.key === 'Enter' && handleSortClick(column.key!),
							disabled
						}
					: {}}
				<th class="p-[unset]!">
					<svelte:element
						this={column?.sortable ? 'button' : 'div'}
						class="flex items-center gap-2 w-full h-full p-2 justify-between {classes}"
						{...props}
					>
						<div class="flex items-center gap-1">
							{#if column?.startIcon}
								<Icon icon={column.startIcon} />
							{/if}
							<span>{column.title}</span>
							{#if column?.endIcon}
								<Icon icon={column.endIcon} />
							{/if}
						</div>
						{#if column?.sortable}
							<span>
								<Icon icon={SortIconsMap[sortState[column.key!]]} />
							</span>
						{/if}
					</svelte:element>
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#if supportDragDrop}
			{#each items as item, idx (idx)}
				<tr
					use:droppable={{
						container: idx.toString(),
						callbacks: { onDrop: handleDrop }
					}}
					animate:flip={{ duration: 200 }}
					in:fade={{ duration: 150 }}
					out:fade={{ duration: 150 }}
					class="svelte-dnd-touch-feedback"
				>
					<td>
						<div use:draggable={{ container: idx.toString(), dragData: idx }}>
							<IconButton icon={ArrowsMove} size="xs" color="gray" variant="light" />
						</div>
					</td>
					{@render customTr(item, columns)}
				</tr>
			{/each}
		{:else}
			{#each items as item, idx (idx)}
				<tr>
					{@render customTr(item, columns)}
				</tr>
			{/each}
		{/if}
	</tbody>
</table>

{#snippet customTr(item: T, columns: TableColumnProps<T, K>[])}
	{#each columns as column, idx (idx)}
		<td>
			{@render column.child({ item })}
		</td>
	{/each}
{/snippet}

<!-- MARK: pagination -->
{#if pagination}
	{@const PAGIN_OPTIONS = ROW_OPTIONS.map<MenuItemProps>((num) => ({
		children: `${num}`,
		onclick: () => handleRowsPerPageChange(num)
	}))}
	<div class="mt-4 flex items-center justify-between">
		<div>
			{#snippet trigger(opts: DropdownTriggerInterface)}
				<Button size="xs" variant="light" {...opts} {disabled}>
					No. of row {innerRowsPerPage}
				</Button>
			{/snippet}
			<DropDown {trigger} placement="bottom-start" options={PAGIN_OPTIONS} />
		</div>
		<div class="flex items-center gap-2 justify-end">
			<IconButton
				icon={ChevronLeft}
				size="xs"
				disabled={!pagination.hasPreviousPage || disabled}
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
				disabled={!pagination.hasNextPage || disabled}
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

<style lang="postcss">
	@reference "tailwindcss"

	td {
		@apply px-1! py-2!;
	}

	:global(.dragging) {
		@apply opacity-50 shadow-lg ring-2 ring-blue-400 rounded-lg;
	}

	:global(.drag-over) {
		@apply bg-blue-50 rounded-lg;
	}
</style>
