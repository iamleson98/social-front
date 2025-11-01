<script lang="ts">
	import { Table } from '$lib/components/ui/Table-v2';
	import type { ColumnDef } from '@tanstack/table-core';

	type Person = {
		name: string;
		age: number;
		email: string;
	};

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
			accessorKey: 'name',
			header: 'Name',
			// cell: ({ row }) => row.original.name,
		},
		{
			accessorKey: 'age',
			header: 'Age',
			// cell: ({ row }) => row.original.age,
		},
		{
			accessorKey: 'email',
			header: 'Email',
			// cell: ({ row }) => row.original.email,
		},
	];
</script>

<Table {items} {columns} />
