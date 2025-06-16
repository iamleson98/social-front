<script lang="ts">
	import Money from '$lib/components/pages/checkout/money.svelte';
	import type { Order } from '$lib/gql/graphql';

	type Props = {
		order: Order;
	};

	let { order }: Props = $props();

	const authorizedAmount = order.totalAuthorized;
	const previouslyRefundedAmount = order.totalRefunded;
	const totalCaptured = order.totalCharged;

	const selectedProductsAmount = {
		amount: 0,
		currency: order.total?.gross?.currency ?? 'PLN',
	};

	const shippingAmount = order.shippingPrice?.gross ?? {
		amount: 0,
		currency: order.total?.gross?.currency ?? 'PLN',
	};

	let maxRefund = $derived({
		amount: (totalCaptured?.amount ?? 0) - (previouslyRefundedAmount?.amount ?? 0),
		currency: order.total?.gross?.currency ?? 'PLN',
	});

	let refundMode: 'none' | 'auto' | 'manual' = $state('none');

	let refundTotal = $derived({
		amount:
			refundMode === 'none'
				? 0
				: refundMode === 'auto'
					? selectedProductsAmount.amount + shippingAmount.amount
					: maxRefund.amount,
		currency: order.total?.gross?.currency ?? 'PLN',
	});
</script>

<div class="bg-white border border-gray-200 rounded-lg p-4 space-y-4 text-sm mt-3">
	<h3 class="font-semibold text-gray-800">Refund Amount</h3>

	<div class="space-y-1">
		<label class="flex items-center gap-2 cursor-pointer">
			<input type="radio" name="refund" bind:group={refundMode} value="none" />
			<span>No refund</span>
		</label>

		<label class="flex items-center gap-2 cursor-pointer">
			<input type="radio" name="refund" bind:group={refundMode} value="auto" />
			<span>Automatic Amount</span>
		</label>

		<label class="flex items-center gap-2 cursor-pointer">
			<input type="radio" name="refund" bind:group={refundMode} value="manual" />
			<span>Manual Amount</span>
		</label>
	</div>

	{#if (previouslyRefundedAmount?.amount ?? 0) > 0}
		<div class="flex justify-between">
			<span>Previously refunded</span>
			<Money money={previouslyRefundedAmount} ariaLabel="Previously refunded" />
		</div>
	{/if}

	<hr />

	<div class="flex justify-between">
		<span>Authorized Amount</span>
		<Money money={authorizedAmount} ariaLabel="Authorized Amount" />
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
