<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import type { Order, OrderLine } from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { orderStatusBadgeClass, stringSlicer } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import Button from '$lib/components/ui/Button/Button.svelte';
	import { Input } from '$lib/components/ui/Input';
	import { onMount } from 'svelte';

	type Props = {
		order: Order;
	};

	let { order }: Props = $props();

	let refundedLines = $state<{ id: string; value: number }[]>([]);

	onMount(() => {
		refundedLines =
			order.lines?.map((line) => ({
				id: line.id,
				value: line.quantity,
			})) || [];
	});

	function handleChange(id: string, value: number) {
		refundedLines = refundedLines.map((line) => (line.id === id ? { ...line, value } : line));
	}

	function handleSetMax() {
		refundedLines =
			order.lines?.map((line) => ({
				id: line.id,
				value: line.quantity,
			})) || [];
	}

	function getQuantity(id: string): number {
		return refundedLines.find((line) => line.id === id)?.value ?? 0;
	}

	function isError(id: string, max: number): boolean {
		const val = getQuantity(id);
		return val < 0 || val > max;
	}

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<OrderLine, any>[] = [
		{ title: 'Image', child: image },
		{ title: 'Product', child: product },
		{ title: 'Price', child: price },
		{ title: 'Refunded Quantity', child: refundedQuantity },
		{ title: 'Total', child: total },
	];
</script>

{#snippet image({ item }: { item: OrderLine })}
	<div class="avatar">
		<div class="w-9 rounded border border-gray-200">
			<img src={item.thumbnail?.url} alt={item.thumbnail?.alt} />
		</div>
	</div>
{/snippet}

{#snippet product({ item }: { item: OrderLine })}
	<span title={item.productName}>
		{stringSlicer(item.productName, 60)}
	</span>
{/snippet}

{#snippet price({ item }: { item: OrderLine })}
	<PriceDisplay
		amount={item.unitPrice?.gross?.amount || 0}
		currency={item.unitPrice?.gross?.currency || ''}
	/>
{/snippet}

{#snippet refundedQuantity({ item }: { item: OrderLine })}
	<Input
		type="number"
		min="0"
		max={item.quantity}
		class="w-20 px-2 py-1 rounded text-right"
		value={getQuantity(item.id)}
		onchange={(e) => handleChange(item.id, parseInt(e.currentTarget.value || '0'))}
	/>
	{#if isError(item.id, item.quantity)}
		<div class="text-xs text-red-500 mt-1">Max: {item.quantity}</div>
	{/if}
{/snippet}

{#snippet total({ item }: { item: OrderLine })}
	<PriceDisplay
		amount={(item.unitPrice?.gross?.amount || 0) * getQuantity(item.id)}
		currency={item.unitPrice?.gross?.currency || ''}
	/>
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

	<Button size="sm" variant="outline" onclick={handleSetMax}>Set maximal quantities</Button>

	<Table columns={PRODUCT_MODAL_COLUMNS} items={order.lines || []} />
</div>
