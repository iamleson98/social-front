<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import { FulfillmentStatus } from '$lib/gql/graphql';
	import type { FulfillmentLine, Order } from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { fulfillmentStatusBadgeClass, orderStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import OrderLineMetadataModal from './order-line-metadata-modal.svelte';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import GeneralMetadataEditor from '../common/general-metadata-editor.svelte';
	import { IconButton } from '$lib/components/ui/Button';
	import { ExternalLink, Icon, Trash } from '$lib/components/icons';
	import FulfillmentCancelModal from './fulfillment-cancel-modal.svelte';
	import OrderLines from './order-lines.svelte';
	import { AppRoute } from '$lib/utils';

	type Props = {
		order: Order;
	};

	let { order }: Props = $props();

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<FulfillmentLine, any>[] = [
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
		{
			title: 'Actions',
			child: actions,
		},
	];

	let orderLineIDForMetadataView = $state<string>();
	let fulfillmentToCancelWarehouseID = $state<string>();
</script>

{#snippet image({ item }: { item: FulfillmentLine })}
	<div class="avatar">
		<div class="w-9 rounded border border-gray-200">
			<img src={item.orderLine?.thumbnail?.url} alt={item.orderLine?.thumbnail?.alt} />
		</div>
	</div>
{/snippet}

{#snippet product({ item }: { item: FulfillmentLine })}
	{item.orderLine?.productName}
{/snippet}

{#snippet sku({ item }: { item: FulfillmentLine })}
	{item.orderLine?.productSku}
{/snippet}

{#snippet variant({ item }: { item: FulfillmentLine })}
	{item.orderLine?.variant?.name}
{/snippet}

{#snippet actions({ item }: { item: FulfillmentLine })}
	<a
		href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.orderLine!.variant!.product.id)}
		class="flex justify-center text-blue-600"
	>
		<Icon icon={ExternalLink} />
	</a>
{/snippet}

{#snippet quantity({ item }: { item: FulfillmentLine })}
	<div class="text-center">{item.quantity}</div>
{/snippet}

{#snippet price({ item }: { item: FulfillmentLine })}
	<PriceDisplay
		amount={item.orderLine?.unitPrice.gross.amount || 0}
		currency={item.orderLine?.unitPrice.gross.currency || ''}
	/>
{/snippet}

{#snippet total({ item }: { item: FulfillmentLine })}
	<PriceDisplay
		amount={item.orderLine?.totalPrice.gross.amount || 0}
		currency={item.orderLine?.totalPrice.gross.currency || ''}
	/>
{/snippet}

{#snippet isGift({ item }: { item: FulfillmentLine })}
	<Checkbox checked={item.orderLine?.isGift} size="sm" disabled />
{/snippet}

{#snippet metadata({ item }: { item: FulfillmentLine })}
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

	{#if order.lines.length}
		<OrderLines orderLines={order.lines} />
	{/if}

	{#each order.fulfillments as fulfillment, idx (idx)}
		<div class="border-b border-gray-200 flex flex-col gap-2 pb-2">
			<SectionHeader>
				<Badge {...fulfillmentStatusBadgeClass(fulfillment.status)} rounded />
				<div class="flex items-center gap-2">
					<span class="text-xs text-gray-500 font-medium">
						Fulfilled from {fulfillment.warehouse?.name}
					</span>
					{#if fulfillment.status === FulfillmentStatus.Fulfilled}
						<IconButton
							icon={Trash}
							size="xs"
							variant="light"
							color="red"
							onclick={() => (fulfillmentToCancelWarehouseID = fulfillment.id)}
						/>
					{/if}
				</div>
			</SectionHeader>

			<div class="overflow-x-auto">
				<Table columns={PRODUCT_MODAL_COLUMNS} items={fulfillment.lines || []} />
			</div>

			<GeneralMetadataEditor
				metadata={fulfillment.metadata}
				privateMetadata={fulfillment.privateMetadata}
				objectId={fulfillment.id}
			/>
		</div>
	{/each}
</div>

<OrderLineMetadataModal
	orderID={order.id}
	orderLineID={orderLineIDForMetadataView}
	onClose={() => (orderLineIDForMetadataView = undefined)}
/>

<FulfillmentCancelModal
	fulfillmentID={fulfillmentToCancelWarehouseID}
	onClose={() => (fulfillmentToCancelWarehouseID = undefined)}
/>
