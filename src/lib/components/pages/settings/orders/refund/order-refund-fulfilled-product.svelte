<script lang="ts">
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import type { Fulfillment, FulfillmentLine } from '$lib/gql/graphql';
	import { stringSlicer } from '$lib/utils/utils';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { Button } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import type { RefundQuantityProps } from '../utils';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';

	type Props = {
		fulfilledFulfillments: Fulfillment[];
		refundedFulfilledProductQuantities: RefundQuantityProps[];
		orderNumber: string;
	};

	let { fulfilledFulfillments, refundedFulfilledProductQuantities, orderNumber }: Props = $props();

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<FulfillmentLine, any>[] = [
		{ title: 'Image', child: image },
		{ title: 'Product', child: product },
		{ title: 'Price', child: price },
		{ title: 'Refunded Quantity', child: refundedQuantity },
		{ title: 'Total', child: total },
	];

	const handleSetMax = () => {};
</script>

{#snippet image({ item }: { item: FulfillmentLine })}
	<Thumbnail
		src={item.orderLine?.thumbnail?.url}
		alt={item.orderLine?.thumbnail?.alt || item.orderLine?.productName || '-'}
	/>
{/snippet}

{#snippet product({ item }: { item: FulfillmentLine })}
	<span title={item.orderLine?.productName}>
		{stringSlicer(item.orderLine?.productName, 60)}
	</span>
{/snippet}

{#snippet price({ item }: { item: FulfillmentLine })}
	{#if item.orderLine?.unitPrice}
		<PriceDisplay {...item.orderLine.unitPrice.gross} />
	{:else}
		<span>-</span>
	{/if}
{/snippet}

{#snippet refundedQuantity({ item }: { item: FulfillmentLine })}
	{@const selectedLineQuantity = refundedFulfilledProductQuantities.find(
		(refundedLine) => refundedLine.id === item.id,
	)}
	{@const error =
		selectedLineQuantity &&
		(selectedLineQuantity?.value > item.quantity || selectedLineQuantity?.value < 0)}
	{#if item.quantity}
		<Input
			type="number"
			min={0}
			max={item.quantity}
			value={selectedLineQuantity?.value}
			onchange={console.log}
			variant={error ? 'error' : 'info'}
		>
			{#snippet action()}
				<span>/ {item.quantity}</span>
			{/snippet}
		</Input>
	{:else}
		<span>-</span>
	{/if}
{/snippet}

{#snippet total({ item }: { item: FulfillmentLine })}
	{@const selectedLineQuantity = refundedFulfilledProductQuantities.find(
		(refundedLine) => refundedLine.id === item.id,
	)}
	{#if item.quantity && item.orderLine?.unitPrice.gross}
		<PriceDisplay
			amount={item.orderLine.unitPrice.gross.amount * (selectedLineQuantity?.value || 1)}
			currency={item.orderLine?.unitPrice.gross.currency}
		/>
	{:else}
		<span>-</span>
	{/if}
{/snippet}

<div class="bg-white rounded-lg border border-gray-200 p-3">
	<!-- <SectionHeader>
		<div class="flex items-center gap-2">
			<div class="text-base font-medium">Order #{order.number}</div>
			<Badge {...orderStatusBadgeClass(order.status)} rounded />
			<div class="text-xs text-gray-500 font-medium">
				{dayjs(order.created).format(SitenameTimeFormat)}
			</div>
		</div>
	</SectionHeader> -->

	{#each fulfilledFulfillments as fulfillment, idx (idx)}
		<div>
			<SectionHeader>Fulfillment #{orderNumber}-{fulfillment.fulfillmentOrder}</SectionHeader>
			<Button size="xs" variant="outline" color="gray" onclick={handleSetMax}>
				Set maximal quantities
			</Button>
			<Table columns={PRODUCT_MODAL_COLUMNS} items={fulfillment.lines || []} />
		</div>
	{/each}
</div>
