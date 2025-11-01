<script lang="ts">
	import { ArrowDown, ArrowUp, Icon } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { Checkbox } from '$lib/components/ui/Input';
	import { type RowOptions } from '$lib/components/ui/Table';
	import { Table as TB } from '$lib/components/ui/Table-v2';
	import { renderSnippet } from '$lib/components/ui/Table-v2/ui/data-table';
	import type { ColumnDef, Row, Table, Column } from '@tanstack/table-core';

	type Person = {
		name: string;
		age: number;
		email: string;
	};

	const normal = '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 3v18m-7-3l-3 3l-3-3m3 3V3m13 3l-3-3l-3 3"/>'

	const items: Person[] = [
		{
			name: 'John Doe',
			age: 30,
			email: 'john.doe@example.com',
		},
		{
			name: 'Jane Smith',
			age: 25,
			email: 'jane.smith@example.com',
		},
		{
			name: 'Bob Johnson',
			age: 35,
			email: 'bob.johnson@example.com',
		},
	];

	const columns: ColumnDef<Person>[] = [
		{
			id: 'select',
			header: ({ table }) => renderSnippet(CheckAll, table),
			cell: ({ row }) => renderSnippet(CheckSingle, row),
		},
		{
			accessorKey: 'name',
			header: 'Name',
			// cell: ({ row }) => row.original.name,
			enableSorting: true,
		},
		{
			accessorKey: 'age',
			header: ({ column }) => {
				return renderSnippet(sort, column);
			},
			enableSorting: true,
			// cell: ({ row }) => row.original.age,
		},
		{
			accessorKey: 'email',
			header: 'Email',
			// cell: ({ row }) => row.original.email,
		},
	];
</script>

{#snippet sort(col: Column<Person, unknown>)}
	{@const sortState = col.getIsSorted()}
	<div class="flex items-center justify-between">
		Age
		<IconButton
			size="xs"
			color="gray"
			variant="light"
			onclick={col.getToggleSortingHandler()}
		>
			{#if !sortState}
				<Icon icon={normal} size="xs" />
			{:else if sortState === 'asc'}
				<Icon icon={ArrowDown} size="xs" />
			{:else if sortState === 'desc'}
				<Icon icon={ArrowUp} size="xs" />
			{/if}
		</IconButton>
	</div>
{/snippet}

{#snippet CheckAll(table: Table<Person>)}
	<Checkbox
		size="sm"
		checked={table.getIsAllPageRowsSelected()}
		aria-label="Select all"
		onCheckChange={table.toggleAllPageRowsSelected}
	/>
{/snippet}

{#snippet CheckSingle(row: Row<Person>)}
	<Checkbox
		size="sm"
		aria-label="Select row"
		checked={row.getIsSelected()}
		onCheckChange={row.toggleSelected}
	/>
{/snippet}

<TB {items} {columns} rowsPerPage={2 as RowOptions} />
