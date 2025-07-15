<script lang="ts">
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import { OpenEye } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Checkbox } from '$lib/components/ui/Input';
	import { GraphqlPaginableTable, Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { ProductOrderField, type Product, type Query } from '$lib/gql/graphql';
	import { toast } from 'svelte-sonner';

	let disabledTable = $state(false);
	let disabledGraphqlTable = $state(false);
	let sortMultipleTable = $state(false);
	let sortMultipleGraphqlTable = $state(false);

	let normalTableColumns = $state<TableColumnProps<Product, ProductOrderField>[]>([]);
	let graphqlTableColumns = $state<TableColumnProps<Product, ProductOrderField>[]>([]);

	$effect(() => {
		normalTableColumns = [
			{ title: 'First Column', child: firstColumn },
			{ title: 'Second Column', child: secondColumn, sortable: sortMultipleTable, key: ProductOrderField.Name },
			{ title: 'Third Column', child: thirdColumn },
			{ title: 'Action Column', child: actionColumn }
		];
	});

	$effect(() => {
		graphqlTableColumns = [
			{ title: 'First Column', child: firstColumn },
			{ title: 'Second Column', child: secondColumn, sortable: sortMultipleGraphqlTable, key: ProductOrderField.Name },
			{ title: 'Third Column', child: thirdColumn },
			{ title: 'Action Column', child: actionColumn }
		];
	});


	const handleCopyNormalTable = () => {
		const code = `<Table
			disabled={${disabledTable}}
			items={[]}
			columns={PRODUCT_COLUMNS}
			sortMultiple={${sortMultipleTable}}
		/>`;

		navigator.clipboard.writeText(code).then(() => {
			toast.success(`Copied code: ${code}`);
		});
	};

	const handleCopyGraphqlTable = () => {
		const code = `<GraphqlPaginableTable
			query={PRODUCT_LIST_QUERY}
			variables={{ first: 10 }}
			resultKey={'products' as keyof Query}
			columns={PRODUCT_COLUMNS}
			disabled={${disabledGraphqlTable}}
			sortMultiple={${sortMultipleGraphqlTable}}
			forceReExecuteGraphqlQuery={true}
		/>`;

		navigator.clipboard.writeText(code).then(() => {
			toast.success(`Copied code: ${code}`);
		});
	};
</script>

{#snippet firstColumn({ item }: { item: Product })}<div>{item.id}</div>{/snippet}
{#snippet secondColumn({ item }: { item: Product })}<div>{item.name}</div>{/snippet}
{#snippet thirdColumn({ item }: { item: Product })}
	{#if item.isAvailable}
		<Badge text="Available" color="green" />
	{:else}
		<Badge text="Not Available" color="red" />
	{/if}
{/snippet}
{#snippet actionColumn({ item }: { item: Product })}
	<IconButton variant="outline" size="xs" onclick={() => {}} icon={OpenEye} />
{/snippet}

<div class="rounded-md p-4 bg-white border mb-4">
	<h2 class="text-lg font-semibold mb-2">Normal Table</h2>
	<div class="flex gap-4 mb-2">
		<Checkbox bind:checked={disabledTable} label="Disabled" />
		<Checkbox bind:checked={sortMultipleTable} label="Sort Multiple" />
	</div>
	<Table
		items={[]}
		columns={normalTableColumns}
		disabled={disabledTable}
		sortMultiple={sortMultipleTable}
	/>
	<Button class="mt-2" onclick={handleCopyNormalTable}>Copy Normal Table</Button>
</div>

<div class="rounded-md p-4 bg-white border">
	<h2 class="text-lg font-semibold mb-2">GraphQL Table</h2>
	<div class="flex gap-4 mb-2">
		<Checkbox bind:checked={disabledGraphqlTable} label="Disabled" />
		<Checkbox bind:checked={sortMultipleGraphqlTable} label="Sort Multiple" />
	</div>
	<GraphqlPaginableTable
		query={PRODUCT_LIST_QUERY}
		variables={{ first: 3 }}
		resultKey={'products' as keyof Query}
		columns={graphqlTableColumns}
		disabled={disabledGraphqlTable}
		sortMultiple={sortMultipleGraphqlTable}
		forceReExecuteGraphqlQuery={true}
	/>
	<Button class="mt-2" onclick={handleCopyGraphqlTable}>Copy GraphQL Table</Button>
</div>
