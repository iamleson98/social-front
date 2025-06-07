<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import type { OrderLine, ProductOrderField } from '$lib/gql/graphql';
	import type { Order } from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { orderStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import OrderLineMetadataModal from './order-line-metadata-modal.svelte';

	type Props = {
		order: Order;
	};

	let { order }: Props = $props();

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

	let orderLineIDForMetadataView = $state<string>();
</script>

{#snippet image({ item }: { item: OrderLine })}
	<div class="avatar">
		<div class="w-9 rounded border border-gray-200">
			<img src={item.thumbnail?.url} alt={item.thumbnail?.alt} />
		</div>
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
	<Checkbox checked={item.isGift} size="sm" />
{/snippet}

{#snippet metadata({ item }: { item: OrderLine })}
	<Button
		size="sm"
		color="gray"
		variant="outline"
		onclick={() => (orderLineIDForMetadataView = item.id)}>View Metadata</Button
	>
{/snippet}

<div class="bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-3">
	<SectionHeader>
		<div class="flex items-center gap-2">
			<div class="text-base font-medium">Order #{order.number}</div>
			<Badge {...orderStatusBadgeClass(order.status)} rounded />
			<div class="text-xs text-gray-500 font-medium">
				{dayjs(order.created).format(SitenameTimeFormat)}
			</div>
		</div>
	</SectionHeader>
	<div class="overflow-x-auto">
		<Table columns={PRODUCT_MODAL_COLUMNS} items={order.lines} />
	</div>

	<div class="text-right">
		<Button size="sm">Fulfill</Button>
	</div>
</div>

<OrderLineMetadataModal
	orderID={order.id}
	orderLineID={orderLineIDForMetadataView}
	onClose={() => (orderLineIDForMetadataView = undefined)}
/>
