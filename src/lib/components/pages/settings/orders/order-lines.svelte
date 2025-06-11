<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import { OrderStatus, type OrderLine } from '$lib/gql/graphql';
	import { orderStatusBadgeClass, stringSlicer } from '$lib/utils/utils';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { AppRoute } from '$lib/utils';
	import { ExternalLink, Icon } from '$lib/components/icons';
	import OrderLineMetadataModal from './order-line-metadata-modal.svelte';
	import OrderFulfillModal from './order-fulfill-modal.svelte';

	type Props = {
		orderLines: OrderLine[];
		orderID: string;
	};

	let { orderLines, orderID }: Props = $props();

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
	<div class="avatar">
		<div class="w-9 rounded border border-gray-200">
			<img src={item?.thumbnail?.url} alt={item?.thumbnail?.alt} />
		</div>
	</div>
{/snippet}

{#snippet actions({ item }: { item: OrderLine })}
	<a
		href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.variant!.product.slug)}
		class="flex justify-center text-blue-600"
		target="_blank"
	>
		<Icon icon={ExternalLink} />
	</a>
{/snippet}

{#snippet product({ item }: { item: OrderLine })}
	<span title={item.productName}>{stringSlicer(item.productName, 60)}</span>
{/snippet}

{#snippet sku({ item }: { item: OrderLine })}
	{item.productSku || '-'}
{/snippet}

{#snippet variant({ item }: { item: OrderLine })}
	{item.variant?.name}
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
		onclick={() => (orderLineIDForMetadataView = item.id)}
	>
		View Metadata
	</Button>
{/snippet}

<div class="border-b border-gray-200 flex flex-col gap-2 pb-2">
	<SectionHeader>
		<Badge {...orderStatusBadgeClass(OrderStatus.Unfulfilled)} rounded />
	</SectionHeader>

	<div class="overflow-x-auto">
		<Table columns={PRODUCT_MODAL_COLUMNS} items={orderLines} />
	</div>

	<div class="text-right">
		<Button size="sm" onclick={() => (openFulfillModal = true)}>Fulfill</Button>
	</div>
</div>

<OrderLineMetadataModal
	{orderID}
	orderLineID={orderLineIDForMetadataView}
	onClose={() => (orderLineIDForMetadataView = undefined)}
/>

<OrderFulfillModal
	open={openFulfillModal}
	onClose={() => (openFulfillModal = false)}
	{orderLines}
/>
