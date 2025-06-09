<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import { OrderStatus, type OrderLine } from '$lib/gql/graphql';
	import { orderStatusBadgeClass } from '$lib/utils/utils';
	import PriceDisplay from '$lib/components/common/price-display.svelte';

	type Props = {
		orderLines: OrderLine[];
	};

	let { orderLines }: Props = $props();

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<OrderLine, any>[] = [
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

	let orderLineIDForMetadataView = $state<string>();
	// let fulfillmentToCancelWarehouseID = $state<string>();
</script>

{#snippet image({ item }: { item: OrderLine })}
	<div class="avatar">
		<div class="w-9 rounded border border-gray-200">
			<img src={item?.thumbnail?.url} alt={item?.thumbnail?.alt} />
		</div>
	</div>
{/snippet}

{#snippet product({ item }: { item: OrderLine })}
	{item?.productName}
{/snippet}

{#snippet sku({ item }: { item: OrderLine })}
	{item?.productSku}
{/snippet}

{#snippet variant({ item }: { item: OrderLine })}
	{item?.variant?.name}
{/snippet}

{#snippet quantity({ item }: { item: OrderLine })}
	<div class="text-center">{item.quantity}</div>
{/snippet}

{#snippet price({ item }: { item: OrderLine })}
	<PriceDisplay
		amount={item?.unitPrice.gross.amount || 0}
		currency={item?.unitPrice.gross.currency || ''}
	/>
{/snippet}

{#snippet total({ item }: { item: OrderLine })}
	<PriceDisplay
		amount={item?.totalPrice.gross.amount || 0}
		currency={item?.totalPrice.gross.currency || ''}
	/>
{/snippet}

{#snippet isGift({ item }: { item: OrderLine })}
	<Checkbox checked={item?.isGift} size="sm" disabled />
{/snippet}

{#snippet metadata({ item }: { item: OrderLine })}
	<Button
		size="sm"
		color="gray"
		variant="outline"
		onclick={() => (orderLineIDForMetadataView = item.id)}>View Metadata</Button
	>
{/snippet}

<div class="border-b border-gray-200 flex flex-col gap-2 pb-2">
	<SectionHeader>
		<Badge {...orderStatusBadgeClass(OrderStatus.Unfulfilled)} rounded />
	</SectionHeader>

	<div class="overflow-x-auto">
		<Table columns={PRODUCT_MODAL_COLUMNS} items={orderLines} />
	</div>

	<div class="text-right">
		<Button size="sm">Fulfill</Button>
	</div>
</div>

<!-- <OrderLineMetadataModal
	orderID={order.id}
	orderLineID={orderLineIDForMetadataView}
	onClose={() => (orderLineIDForMetadataView = undefined)}
/> -->

<!-- <FulfillmentCancelModal
	fulfillmentID={fulfillmentToCancelWarehouseID}
	onClose={() => (fulfillmentToCancelWarehouseID = undefined)}
/> -->
