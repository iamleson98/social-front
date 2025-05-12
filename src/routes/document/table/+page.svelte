<script lang="ts">
	import { COLLECTION_PRODUCTS_QUERY } from '$lib/api/admin/collections';
	import { OpenEye } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/badge';
	import IconButton from '$lib/components/ui/Button/IconButton.svelte';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Product, ProductOrderField, Query } from '$lib/gql/graphql';

	let loading = $state(false);

	const PRODUCT_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = [
		{
			title: 'First Column',
			child: firstColumn
		},
		{
			title: 'Second Column',
			child: secondColumn
		},
		{
			title: 'Third Column',
			child: thirdColumn
		},
		{
			title: 'Action Column',
			child: actionColumn
		}
	];
</script>

{#snippet firstColumn({ item }: { item: Product })}
	<div>{item.id}</div>
{/snippet}

{#snippet secondColumn({ item }: { item: Product })}
	<div>{item.name}</div>
{/snippet}

{#snippet thirdColumn({ item }: { item: Product })}
	{#if item.isAvailable}
		<Badge
			text="Available"
			color="green"
		/>
	{:else}
		<Badge
			text="Not Available"
			color="red"
		/>
	{/if}
{/snippet}

{#snippet actionColumn({ item }: { item: Product })}
	<IconButton
		variant="outline"
		size="xs"
		onclick={() => {}}
		icon={OpenEye}
	/>
{/snippet}

<div class="w-md rounded-md p-2">
	<GraphqlPaginableTable
		query={COLLECTION_PRODUCTS_QUERY}
		variables={{
			first: 10
		}}
		resultKey={'collection.products' as keyof Query}
		columns={PRODUCT_COLUMNS}
		forceReExecuteGraphqlQuery={true}
		disabled={loading}
	/>
</div>