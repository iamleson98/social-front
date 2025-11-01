<script lang="ts" generics="T extends Record<string, unknown>, K extends string">
	import { createSvelteTable, FlexRender } from './ui/data-table';
	import { Body, Cell, Head, Header, Root, Row } from './ui/table';
	import type { TableProps } from './types';
	import { getCoreRowModel } from '@tanstack/table-core';

	let { columns, items, className }: TableProps<T, K> = $props();

	const Table = createSvelteTable({
		get data() {
			return items;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
	});
</script>

<div class={[className, 'w-full overflow-x-auto']}>
	<Root>
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
</div>
