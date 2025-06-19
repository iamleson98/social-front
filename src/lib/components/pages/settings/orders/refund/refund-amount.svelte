<script lang="ts">
	import Money from '$lib/components/pages/checkout/money.svelte';
	import Radio from '$lib/components/ui/Input/radio.svelte';
	import type { Order } from '$lib/gql/graphql';

	type Props = {
		order: Order;
	};

	let { order }: Props = $props();

	let selectedProductsAmount = $state({
		amount: 0,
		currency: order.total?.gross?.currency ?? 'VND',
	});

	let shippingAmount = $state(
		order.shippingPrice?.gross ?? {
			amount: 0,
			currency: order.total?.gross?.currency ?? 'VND',
		},
	);

	let maxRefund = $derived.by(() => ({
		amount: (order.totalCharged?.amount ?? 0) - (order.totalRefunded?.amount ?? 0),
		currency: order.total?.gross?.currency ?? 'VND',
	}));

	let refundMode: 'none' | 'auto' | 'manual' = $state('auto');

	let refundTotal = $derived.by(() => {
		return {
			amount:
				refundMode === 'none'
					? 0
					: refundMode === 'auto'
						? selectedProductsAmount.amount + shippingAmount.amount
						: maxRefund.amount,
			currency: order.total?.gross?.currency ?? 'VND',
		};
	});
</script>

<div class="bg-white border border-gray-200 rounded-lg p-3 space-y-4 text-sm mt-3">
	<h3 class="font-semibold text-gray-800">Refund Amount</h3>

	<div class="space-y-1">
		<Radio name="refund" bind:group={refundMode} value="none" label="No refund" />

		<Radio name="refund" bind:group={refundMode} value="auto" label="Automatic Amount" />

		<Radio name="refund" bind:group={refundMode} value="manual" label="Manual Amount" />
	</div>

	{#if (order.totalRefunded?.amount ?? 0) > 0}
		<div class="flex justify-between">
			<span>Previously refunded</span>
			<Money money={order.totalRefunded} ariaLabel="Previously refunded" />
		</div>
	{/if}

	<hr />

	<div class="flex justify-between">
		<span>Authorized Amount</span>
		<Money money={order.totalAuthorized} ariaLabel="Authorized Amount" />
	</div>

	<div class="flex justify-between">
		<span>Selected Products Value</span>
		<Money money={selectedProductsAmount} ariaLabel="Selected Products Value" />
	</div>

	<div class="flex justify-between">
		<span>Refund shipment costs</span>
		<Money money={shippingAmount} ariaLabel="Refund shipment costs" />
	</div>

	<div class="flex justify-between">
		<span>Max Refund</span>
		<Money money={maxRefund} ariaLabel="Max Refund" />
	</div>

	<hr />

	<div class="flex justify-between font-semibold">
		<span>Refund total amount</span>
		<Money money={refundTotal} ariaLabel="Refund total amount" />
	</div>
</div>
