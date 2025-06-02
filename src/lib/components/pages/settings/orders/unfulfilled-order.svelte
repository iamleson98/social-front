<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import type { OrderLine, ProductOrderField } from '$lib/gql/graphql';

	type Props = {
		orderLines?: OrderLine[];
	};

	let { orderLines }: Props = $props();

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<OrderLine, ProductOrderField>[] = [
		{
			title: 'Image',
			child: image,
		},
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
</script>

{#snippet image({ item }: { item: OrderLine })}
	<div class="flex items-center gap-2">
		<img class="w-12 h-12" src={item.thumbnail?.url} alt={item.productName} />
	</div>
{/snippet}

{#snippet product({ item }: { item: OrderLine })}
	{item.productName}
{/snippet}

{#snippet sku({ item }: { item: OrderLine })}
	{item.productSku}
{/snippet}

{#snippet variant({ item }: { item: OrderLine })}
	{item.variantName}
{/snippet}

{#snippet quantity({ item }: { item: OrderLine })}
	{item.quantity}
{/snippet}

{#snippet price({ item }: { item: OrderLine })}
	{item.unitPrice.gross.amount}
{/snippet}

{#snippet total({ item }: { item: OrderLine })}
	{item.totalPrice.gross.amount}
{/snippet}

{#snippet isGift({ item }: { item: OrderLine })}
	<Checkbox checked={item.isGift} />
{/snippet}

{#snippet metadata()}
	<Button size="xs" variant="light">View Metadata</Button>
{/snippet}

<div class="bg-white rounded-lg border border-gray-200 p-3 overflow-x-auto">
	<Table columns={PRODUCT_MODAL_COLUMNS} items={orderLines ?? []} />
	<Button size="xs" class="mt-2">Fulfill</Button>
</div>
