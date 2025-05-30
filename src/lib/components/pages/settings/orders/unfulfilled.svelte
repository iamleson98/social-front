<script lang="ts">
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { Button } from '$lib/components/ui';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import { GraphqlPaginableTable } from '$lib/components/ui/Table';
	import type { Product, ProductOrderField, QueryProductsArgs } from '$lib/gql/graphql';

	type Props = {
		orderID?: string;
		onApply: (addProducts: Product[], removeProductIds: string[]) => Promise<void>;
		disabled?: boolean;
	};

	let { orderID, onApply, disabled }: Props = $props();

	let forceReExecuteGraphqlQuery = $state(false);
	let loading = $state(false);
	let shouldDisable = $derived(loading || disabled);

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = [
		{
			title: 'Product',
			child: product,
		},
		{
			title: 'SKU',
			child: sku,
		},
		{
			title: 'Variant',
			child: variant,
		},
		{
			title: 'Quantity',
			child: quantity,
		},
		{
			title: 'Price',
			child: price,
		},
		{
			title: 'Total',
			child: total,
		},
		{
			title: 'Is gift',
			child: isGift,
		},
		{
			title: 'Metadata',
			child: metadata,
		},
	];

	let filterAllProductsVariables = $state<QueryProductsArgs>({
		first: 10,
		filter: {
			search: '',
		},
	});
</script>

{#snippet product({ item }: { item: Product })}
	{item.name}
{/snippet}

{#snippet sku({ item }: { item: Product })}{/snippet}

{#snippet variant({ item }: { item: Product })}{/snippet}

{#snippet quantity({ item }: { item: Product })}{/snippet}

{#snippet price({ item }: { item: Product })}{/snippet}

{#snippet total({ item }: { item: Product })}{/snippet}

{#snippet isGift({ item }: { item: Product })}
	<Checkbox disabled />
{/snippet}

{#snippet metadata({ item }: { item: Product })}
	<Button size="xs" variant="light">View Metadata</Button>
{/snippet}

<div>
	<GraphqlPaginableTable
		query={PRODUCT_LIST_QUERY_ADMIN}
		resultKey={'products'}
		bind:variables={filterAllProductsVariables}
		bind:forceReExecuteGraphqlQuery
		columns={PRODUCT_MODAL_COLUMNS}
		disabled={shouldDisable}
	/>
</div>
