<script lang="ts" generics="T extends Record<string, unknown>, K extends string">
	import { dev } from '$app/environment';
	import {
		ArrowDown,
		ArrowUp,
		ChevronLeft,
		ChevronRight,
		GripVertical,
		Icon,
	} from '$lib/components/icons';
	import { TablerBox, TablerDots } from '$lib/components/icons/consts';
	import { IconButton, Button } from '$lib/components/ui/Button';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { Sticky } from '$lib/components/ui/Popover';
	import { OrderDirection } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import {
		ROW_OPTIONS,
		type RowOptions,
		type SortState,
		type TableColumnProps,
		type TableProps,
	} from './types';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
	import { Pagination } from 'bits-ui';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	/**
	 * Local mirror of bits-ui's (unexported) `PageItem` type — used to type the
	 * `children` snippet params of `Pagination.Root`, which the language
	 * server cannot infer on its own.
	 */
	type BitsPageItem = ({ type: 'page'; value: number } | { type: 'ellipsis' }) & { key: string };
	type BitsButtonChildProps = { props: Record<string, any> };

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
		emptyText,
	}: TableProps<T, K> = $props();

	if (onDragEnd && dev) {
		console.warn(
			'NOTE: Seems like your table supports drag and drop. If some of your cell component are interactive E.g: (a, input, textarea, button, etc), you should add `data-interactive` attribute to them',
		);
	}

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

	const handleSortClick = (columnKey: K, dir: OrderDirection) => {
		const colSortState: SortState<K> = {
			[columnKey]: dir,
		} as SortState<K>;
		// if (sortState[columnKey] === 'NEUTRAL') {
		//      colSortState[columnKey] = OrderDirection.Asc;
		// } else if (sortState[columnKey] === OrderDirection.Asc) {
		//      colSortState[columnKey] = OrderDirection.Desc;
		// } else {
		//      colSortState[columnKey] = 'NEUTRAL';
		// }
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
		<td colspan={columns.length}>
			<div class="py-12 text-center select-none!">
				<div
					class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400"
				>
					<Icon icon={TablerBox} size="sm" />
				</div>
				<div class="text-sm font-medium text-gray-500">{emptyText || 'No data'}</div>
			</div>
		</td>
	</tr>
{/snippet}

<!--
        NOTE: when table is empty, the "rows-per-page" dropdown will be affected by table overflow effect. 
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
							{@const width = !column.width
								? 'unset'
								: typeof column.width === 'number'
									? `${column.width}px`
									: column.width}
							<th style:width>
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
										<DropDown
											options={[
												{
													children: 'Sort Asc',
													startIcon: ArrowUp,
													onclick: () => handleSortClick(column.key!, OrderDirection.Asc),
													class:
														sortState[column.key] === OrderDirection.Asc
															? 'bg-gray-100'
															: undefined,
												},
												{
													children: 'Sort Desc',
													startIcon: ArrowDown,
													onclick: () => handleSortClick(column.key!, OrderDirection.Desc),
													class:
														sortState[column.key] === OrderDirection.Desc
															? 'bg-gray-100'
															: undefined,
												},
											]}
										>
											{#snippet trigger({ onclick })}
												<IconButton
													size="xs"
													variant="light"
													color="gray"
													aria-label="Sort column"
													{onclick}
													disabled={disabled || !items.length}
													icon={TablerDots}
												/>
											{/snippet}
										</DropDown>
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

	<!-- MARK: pagination (hidden when there is nothing to paginate) -->
	{#if (graphqlPagination || restPagination) && items.length}
		<div class="mt-3 mb-1 flex justify-between w-full items-center px-1">
			<Button
				size="xs"
				variant="light"
				disabled={disabled || !items.length}
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
					{#snippet children({ pages }: { pages: BitsPageItem[] })}
						<div class="flex items-center">
							<Pagination.PrevButton>
								{#snippet child({ props }: BitsButtonChildProps)}
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
											{#snippet child({ props }: BitsButtonChildProps)}
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
								{#snippet child({ props }: BitsButtonChildProps)}
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

	/*
         * Design System v2 (admin): tables drop the zebra striping and the
         * vertical column separators in favour of comfortable cell padding,
         * a quiet header row and hairline row dividers with a soft hover.
         */
	th {
		@apply text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50/75 py-2.5 px-3 text-nowrap;
	}

	tbody tr {
		@apply border-b border-gray-100;
	}

	tbody > tr:hover {
		/* bg-brand-50/40 — expressed via color-mix because `@apply` inside a
		 * scoped style block cannot resolve custom theme utilities */
		background-color: color-mix(in oklab, var(--color-brand-50) 40%, transparent);
	}

	td {
		@apply px-3 py-2.5!;
	}
</style>
