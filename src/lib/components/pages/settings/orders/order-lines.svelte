<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/Badge';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import { OrderStatus, type Order, type OrderLine } from '$lib/gql/graphql';
	import { orderStatusBadgeClass, SitenameCommonClassName, stringSlicer } from '$lib/utils/utils';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { AppRoute } from '$lib/utils';
	import { Dots, ExternalLink, Icon, Trash } from '$lib/components/icons';
	import OrderLineMetadataModal from './order-line-metadata-modal.svelte';
	import OrderFulfillModal from './order-fulfill-modal.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { IconButton } from '$lib/components/ui/Button';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';

	type Props = {
		orderLines: OrderLine[];
		order: Order;
		onFulfillSuccess: () => void;
	};

	let { orderLines, order, onFulfillSuccess }: Props = $props();

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
		{
			title: 'Actions',
			child: actions,
		},
	];

	let orderLineIDForMetadataView = $state<string>();

	let openFulfillModal = $state(false);
</script>

{#snippet image({ item }: { item: OrderLine })}
	<Thumbnail src={item?.thumbnail?.url} alt={item?.thumbnail?.alt || item.productName} size="sm" />
{/snippet}

{#snippet actions({ item }: { item: OrderLine })}
	<div class="text-center">
		<DropDown placement="bottom-end">
			{#snippet trigger({ onclick }: DropdownTriggerInterface)}
				<IconButton size="xs" icon={Dots} {onclick} variant="light" color="gray" />
			{/snippet}

			<MenuItem
				startIcon={ExternalLink}
				href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.variant!.product.slug)}
				class="text-blue-500"
			>
				View product
			</MenuItem>
			{#if order.status === OrderStatus.Draft}
				<MenuItem startIcon={Trash} onclick={() => {}} class="text-red-500">Remove</MenuItem>
			{/if}
		</DropDown>
	</div>
{/snippet}

{#snippet product({ item }: { item: OrderLine })}
	<span title={item.productName}>{stringSlicer(item.productName, 60)}</span>
{/snippet}

{#snippet sku({ item }: { item: OrderLine })}
	{item.productSku || '-'}
{/snippet}

{#snippet variant({ item }: { item: OrderLine })}
	{item.variant?.name || '-'}
{/snippet}

{#snippet quantity({ item }: { item: OrderLine })}
	<div class="text-center">{item.quantity}</div>
{/snippet}

{#snippet price({ item }: { item: OrderLine })}
<div class="flex items-center gap-2">
	{#if item.undiscountedUnitPrice}
	 <PriceDisplay {...item.undiscountedUnitPrice.gross} class="line-through" />
	{/if}
	<PriceDisplay {...item.unitPrice.gross} />
</div>
{/snippet}

{#snippet total({ item }: { item: OrderLine })}
	<PriceDisplay {...item.totalPrice.gross} />
{/snippet}

{#snippet isGift({ item }: { item: OrderLine })}
	<div class="text-center">
		<Badge size="xs" color={item.isGift ? 'green' : 'red'} text={item.isGift ? 'yes' : 'no'} />
	</div>
{/snippet}

{#snippet metadata({ item }: { item: OrderLine })}
	<Button
		size="sm"
		color="gray"
		variant="outline"
		onclick={() => (orderLineIDForMetadataView = item.id)}
	>
		View Metadata
	</Button>
{/snippet}

<div class="overflow-x-auto">
	<Table columns={PRODUCT_MODAL_COLUMNS} items={orderLines} />
</div>

<OrderLineMetadataModal
	orderID={order.id}
	orderLineID={orderLineIDForMetadataView}
	onClose={() => (orderLineIDForMetadataView = undefined)}
/>

<!-- <OrderFulfillModal bind:open={openFulfillModal} {onFulfillSuccess} {orderLines} {order} /> -->
