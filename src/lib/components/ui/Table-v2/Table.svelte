<script lang="ts" generics="T extends Record<string, unknown>, K extends string">
	import { ChevronLeft, ChevronRight } from '$lib/components/icons';
	import { Button, IconButton } from '../Button';
	import { DropDown, type MenuItemProps } from '../Dropdown';
	import { ROW_OPTIONS } from '../Table/types';
	import type { TableProps } from './types';
	import { createSvelteTable, FlexRender } from './ui/data-table';
	import { Body, Cell, Head, Header, Root, Row } from './ui/table';
	import {
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
	} from '@tanstack/table-core';

	let {
		columns,
		items,
		className,
		rowsPerPage = 100,
		onChangeRowsPerPage,
		disabled,
	}: TableProps<T, K> = $props();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: rowsPerPage });
	let sorting = $state<SortingState>([]);
	let rowSelection = $state<RowSelectionState>({});

	const Table = createSvelteTable({
		get data() {
			return items;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get rowSelection() {
				return rowSelection;
			},
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
	});

	// const handleRowsPerPageChange = (num: RowOptions) => {
	// 	if (num !== innerRowsPerPage) {
	// 		innerRowsPerPage = num;
	// 		onChangeRowsPerPage?.(num);
	// 	}
	// };
</script>

<div class={[className, 'w-full bg-white rounded-lg border p-2 border-gray-200']}>
	<Root class="table">
		<Header>
			{#each Table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Row>
					{#each headerGroup.headers as header (header.id)}
						<Head colspan={header.colSpan}>
							{#if !header.isPlaceholder}
								<FlexRender
									content={header.column.columnDef.header}
									context={header.getContext()}
								/>
							{/if}
						</Head>
					{/each}
				</Row>
			{/each}
		</Header>

		<Body>
			{#each Table.getRowModel().rows as row (row.id)}
				<Row data-state={row.getIsSelected() && 'selected'}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Cell>
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</Cell>
					{/each}
				</Row>
			{:else}
				<Row>
					<Cell colspan={columns.length} class="h-24 text-center">No data.</Cell>
				</Row>
			{/each}
		</Body>
	</Root>

	<div class="flex items-center justify-end space-x-2 py-2 px-1">
		<DropDown
			placement="bottom-start"
			options={ROW_OPTIONS.map<MenuItemProps>((num) => ({
				children: `${num}`,
				onclick: () => Table.setPageSize(num),
			}))}
		>
			{#snippet trigger(opts)}
				<Button size="xs" variant="light" {...opts} {disabled}>
					{'Rows per page'}:
					{pagination.pageSize}
				</Button>
			{/snippet}
		</DropDown>
		<IconButton
			icon={ChevronLeft}
			size="xs"
			variant="light"
			color="gray"
			onclick={Table.previousPage}
			disabled={!Table.getCanPreviousPage() || disabled}
		/>
		<IconButton
			icon={ChevronRight}
			size="xs"
			variant="light"
			color="gray"
			onclick={Table.nextPage}
			disabled={!Table.getCanNextPage() || disabled}
		/>
	</div>
</div>
