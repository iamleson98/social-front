<script lang="ts">
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import type { OrderLine } from '$lib/gql/graphql';
	import { stringSlicer } from '$lib/utils/utils';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { Button } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import type { RefundQuantityProps } from './utils';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';

	type Props = {
		unfulfilledOrderLines: OrderLine[];
		refundedProductQuantities: RefundQuantityProps[];
	};

	let { unfulfilledOrderLines, refundedProductQuantities = $bindable([]) }: Props = $props();

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<OrderLine, any>[] = [
		{ title: 'Image', child: image },
		{ title: 'Product', child: product },
		{ title: 'Price', child: price },
		{ title: 'Refunded Quantity', child: refundedQuantity },
		{ title: 'Total', child: total },
	];

	const handleSetMaxRefundQuantity = () => {
		refundedProductQuantities = refundedProductQuantities.map((selectedLine) => {
			const line = unfulfilledOrderLines.find((line) => line.id === selectedLine.id);
			if (!line) return selectedLine;
			return {
				...selectedLine,
				value: line.quantityToFulfill,
			};
		});
	};

	const handleInputChange = (e: Event, idx: number) => {
		const target = e.target as HTMLInputElement;
		const value = parseInt(target.value || '0');
		const line = unfulfilledOrderLines[idx];
		if (!line) return;

		refundedProductQuantities = refundedProductQuantities.map((selectedLine) => {
			if (selectedLine.id !== line.id) return selectedLine;
			return {
				...selectedLine,
				value,
			};
		});
	};
</script>

{#snippet image({ item }: { item: OrderLine })}
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.productName} />
{/snippet}

{#snippet product({ item }: { item: OrderLine })}
	<span title={item.productName}>
		{stringSlicer(item.productName, 60)}
	</span>
{/snippet}

{#snippet price({ item }: { item: OrderLine })}
	<PriceDisplay {...item.unitPrice.gross} />
{/snippet}

{#snippet refundedQuantity({ item, idx }: { item: OrderLine; idx: number })}
	{#if item.quantityToFulfill || item.quantityToFulfill === 0}
		{@const selectedLineQuantity = refundedProductQuantities.find((line) => line.id === item.id)}
		{@const error =
			selectedLineQuantity &&
			(selectedLineQuantity?.value > item.quantityToFulfill || selectedLineQuantity?.value < 0)}
		<Input
			type="number"
			min={0}
			max={item.quantityToFulfill}
			value={selectedLineQuantity?.value}
			disabled={item.quantityToFulfill === 0}
			variant={error ? 'error' : 'info'}
			subText={error ? 'Quantity is out of range' : undefined}
			inputDebounceOption={{ onInput: (e) => handleInputChange(e, idx) }}
		>
			{#snippet action()}
				<span>/ {item.quantityToFulfill}</span>
			{/snippet}
		</Input>
	{:else}
		<span>-</span>
	{/if}
{/snippet}

{#snippet total({ item }: { item: OrderLine })}
	{@const selectedLineQuantity = refundedProductQuantities.find((line) => line.id === item.id)}
	{#if item.unitPrice.gross}
		<PriceDisplay
			amount={item.unitPrice.gross.amount * (selectedLineQuantity?.value || 0)}
			currency={item.unitPrice.gross.currency}
		/>
	{:else}
		<span>-</span>
	{/if}
{/snippet}

<div class="bg-white rounded-lg border border-gray-200 p-3 space-y-1">
	<SectionHeader>Unfulfilled Products</SectionHeader>
	<p class="text-xs">Unfulfilled products will be restocked</p>
	<Button size="xs" variant="outline" color="gray" onclick={handleSetMaxRefundQuantity}>
		Set maximal quantities
	</Button>

	<Table columns={PRODUCT_MODAL_COLUMNS} items={unfulfilledOrderLines} />
</div>
