<script lang="ts" generics="T extends Record<string, unknown>, K extends string">
	import { ChevronLeft, ChevronRight, GripVertical, Icon } from '$lib/components/icons';
	import { IconButton, Button } from '$lib/components/ui/Button';
	import { MenuItem } from '$lib/components/ui/Dropdown';
	import { OrderDirection } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { Sticky } from '$lib/components/ui/Popover';
	import {
		ROW_OPTIONS,
		SortIconsMap,
		type RowOptions,
		type SortState,
		type TableColumnProps,
		type TableProps,
	} from './types';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
	import { Pagination } from 'bits-ui';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	let {
		items = [],
		columns,
		class: className = SitenameCommonClassName,
		graphqlPagination,
		restPagination,
		onNextPagelick,
		onPreviousPagelick,
		onChangeRowsPerPage,
		onSortChange,
		rowsPerPage,
		sortMultiple = false,
		defaultSortState = {} as SortState<K>,
		disabled = false,
		onDragEnd,
		headless,
		maxHeight,
		numOfRowsTitle,
		prevPageTitle,
		nextPageTitle,
	}: TableProps<T, K> = $props();

	const DEFAULT_SORT_STATE = columns.reduce<SortState<K>>((acc, column) => {
		return column.key ? { ...acc, [column.key]: 'NEUTRAL' } : acc;
	}, {} as SortState<K>);
	let innerRowsPerPage = $state<number>(rowsPerPage || ROW_OPTIONS[0]);
	let sortState = $state.raw<SortState<K>>({ ...DEFAULT_SORT_STATE, ...defaultSortState });
	let numPerPageButtonRef = $state<HTMLButtonElement>();

	const handleGraphqlNavigationClick = (dir: 1 | -1) => {
		if (!graphqlPagination) return;
		if (dir === -1 && graphqlPagination.startCursor)
			onPreviousPagelick?.(graphqlPagination.startCursor);
		else if (dir === 1 && graphqlPagination.endCursor)
			onNextPagelick?.(graphqlPagination.endCursor);
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
		if (!onDragEnd) return;

		const { draggedItem, targetContainer } = state;
		const dropIndex = parseInt(targetContainer ?? '0');
		onDragEnd(draggedItem, dropIndex);
	};
</script>

{#snippet customTr(item: T, columns: TableColumnProps<T, K>[], itemIdx: number)}
	{#each columns as column, idx (idx)}
		<td>
			{#if typeof column.child === 'object'}
				{column.child.render({ item, idx: itemIdx })}
			{:else}
				{@render column.child({ item, idx: itemIdx })}
			{/if}
		</td>
	{/each}
{/snippet}

{#snippet noData()}
	<tr>
		<td class="text-sm select-none! text-gray-400 text-center" colspan={columns.length}>
			No data
		</td>
	</tr>
{/snippet}

<!--
	NOTE: when table is empty, the number of items per page drop down will be affected by table overflow effect. 
 	Using a sticky component outside of table, and attach it to the num per page button, when it is clicked, solves this issue
-->
<Sticky bind:target={numPerPageButtonRef} placement="bottom-start">
	<div class="py-2 rounded-lg border border-gray-200 bg-white shadow-sm">
		{#each ROW_OPTIONS as num, idx (idx)}
			<MenuItem onclick={() => handleRowsPerPageChange(num)} isActive={num === innerRowsPerPage}>
				{num}
			</MenuItem>
		{/each}
	</div>
</Sticky>

<div class={[className, 'w-full overflow-x-auto']}>
	<div class="overflow-y-auto" style:max-height={maxHeight ? `${maxHeight}px !important` : 'unset'}>
		<table class="table" class:disable-table={disabled}>
			{#if !headless}
				<thead class={[!!maxHeight && 'sticky! top-0! shadow-xs bg-inherit']}>
					<tr>
						{#if onDragEnd}
							<th></th>
						{/if}
						{#each columns as column, idx (idx)}
							<th style:width={column.width ? `${column.width}px` : 'unset'}>
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-1">
										{#if column?.startIcon}
											<Icon icon={column.startIcon} size="sm" />
										{/if}
										{#if typeof column.title === 'string'}
											<span>{column.title}</span>
										{:else}
											{@render column.title({ items })}
										{/if}
										{#if column?.endIcon}
											<Icon icon={column.endIcon} size="sm" />
										{/if}
									</div>

									{#if column.key}
										<IconButton
											size="xs"
											variant="light"
											color="gray"
											aria-label="Sort column"
											onclick={() => handleSortClick(column.key!)}
											{disabled}
											icon={SortIconsMap[sortState[column.key]]}
										/>
									{/if}
								</div>
							</th>
						{/each}
					</tr>
				</thead>
			{/if}
			<tbody>
				{#if onDragEnd}
					{#each items as item, idx (idx)}
						<tr
							use:droppable={{
								container: idx.toString(),
								callbacks: { onDrop: handleDrop },
							}}
							use:draggable={{
								container: idx.toString(),
								dragData: idx,
								interactive: ['[data-interactive]'], // within cell definition, add `data-interactive` to the element if you want to exclude it from draggable
							}}
							animate:flip={{ duration: 200 }}
							in:fade={{ duration: 150 }}
							out:fade={{ duration: 150 }}
							class="svelte-dnd-touch-feedback"
						>
							<td>
								<div>
									<IconButton
										icon={GripVertical}
										size="xs"
										aria-label="Drag drop"
										color="gray"
										variant="light"
										{disabled}
									/>
								</div>
							</td>
							{@render customTr(item, columns, idx)}
						</tr>
					{:else}
						{@render noData()}
					{/each}
				{:else}
					{#each items as item, idx (idx)}
						<tr>
							{@render customTr(item, columns, idx)}
						</tr>
					{:else}
						{@render noData()}
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- MARK: pagination -->
	{#if graphqlPagination || restPagination}
		<div class="mt-4 flex justify-between w-full items-center">
			<Button
				size="xs"
				variant="light"
				{disabled}
				onclick={(evt) => (numPerPageButtonRef = evt.currentTarget as HTMLButtonElement)}
			>
				{numOfRowsTitle || 'Rows per page'}:
				{innerRowsPerPage}
			</Button>

			{#if graphqlPagination}
				<div class="flex items-center gap-2">
					<IconButton
						icon={ChevronLeft}
						size="xs"
						disabled={!graphqlPagination.hasPreviousPage || disabled}
						aria-label="Previous page"
						class="tooltip tooltip-left"
						data-tip={prevPageTitle || 'Previous page'}
						color="gray"
						variant="light"
						onclick={() => handleGraphqlNavigationClick(-1)}
					/>
					<IconButton
						icon={ChevronRight}
						size="xs"
						disabled={!graphqlPagination.hasNextPage || disabled}
						aria-label="Next page"
						class="tooltip tooltip-left"
						data-tip={nextPageTitle || 'Next page'}
						color="gray"
						variant="light"
						onclick={() => handleGraphqlNavigationClick(1)}
					/>
				</div>
			{:else if restPagination}
				<Pagination.Root count={restPagination.totalCount} perPage={restPagination.rowsPerPage}>
					{#snippet children({ pages })}
						<div class="flex items-center">
							<Pagination.PrevButton>
								{#snippet child({ props })}
									<IconButton
										icon={ChevronLeft}
										variant="light"
										color="gray"
										size="xs"
										{...props}
										class="mr-2 tooltip tooltip-left"
										data-tip={prevPageTitle || 'Previous page'}
									/>
								{/snippet}
							</Pagination.PrevButton>
							<div class="flex items-center gap-2.5">
								{#each pages as page (page.key)}
									{#if page.type === 'ellipsis'}
										<div class="text-foreground-alt select-none text-sm font-medium">...</div>
									{:else}
										<Pagination.Page {page}>
											{#snippet child({ props })}
												<IconButton
													color="gray"
													size="xs"
													{...props}
													variant="light"
													class="mr-2 data-selected:bg-gray-600! data-selected:text-white!"
												>
													{page.value}
												</IconButton>
											{/snippet}
										</Pagination.Page>
									{/if}
								{/each}
							</div>
							<Pagination.NextButton>
								{#snippet child({ props })}
									<IconButton
										icon={ChevronRight}
										variant="light"
										color="gray"
										size="xs"
										class="ml-2 tooltip tooltip-left"
										data-tip={nextPageTitle || 'Next page'}
										{...props}
									/>
								{/snippet}
							</Pagination.NextButton>
						</div>
					{/snippet}
				</Pagination.Root>
			{/if}
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "tailwindcss"

	:global(.dragging) {
		@apply opacity-50 shadow-lg rounded-lg;
	}

	:global(.drag-over) {
		@apply bg-blue-50 rounded-lg;
	}

	.disable-table button,
	.disable-table input,
	.disable-table select,
	.disable-table textarea,
	.disable-table a {
		@apply pointer-events-none! cursor-not-allowed!;
	}

	th:not(:last-child) {
		@apply border-r border-gray-200 py-1 px-1.5;
	}

	tr:nth-child(even) {
		@apply bg-gray-50;
	}

	tbody > tr:hover {
		@apply bg-gray-50;
	}

	td {
		@apply p-1.5!;
	}
</style>
