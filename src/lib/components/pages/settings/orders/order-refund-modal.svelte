<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox, RadioButton } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import type { Money, Order } from '$lib/gql/graphql';
	import {
		getOrderCharged,
		getPreviouslyRefundedPrice,
		getShipmentCost,
		OrderRefundType,
		refundFulfilledStatuses,
		type RefundQuantityProps,
	} from './utils';
	import OrderRefundFulfilledProduct from './order-refund-fulfilled-product.svelte';
	import OrderRefundUnfulfilledProduct from './order-refund-unfulfilled-product.svelte';
	import PaymentSubmitCardValues from './payment-submit-card-values.svelte';

	type Props = {
		open: boolean;
		order: Order;
	};

	let { open = $bindable(), order }: Props = $props();

	type AmountInputType = 'no-refund' | 'automatic-amount' | 'manual-amount';

	type RefundProps = {
		label: string;
		amountType: AmountInputType;
		disabled?: boolean;
	};

	const REFUND_AMOUNT_OPTIONS: RefundProps[] = [
		{
			label: 'No refund',
			amountType: 'no-refund',
			disabled: true,
		},
		{
			label: 'Automatic amount',
			amountType: 'automatic-amount',
		},
		{
			label: 'Manual amount',
			amountType: 'manual-amount',
		},
	];
	const refundTypes = [OrderRefundType.PRODUCTS, OrderRefundType.MISCELLANEOUS];

	let amountType = $state<AmountInputType>('automatic-amount');
	let refundShipmentCosts = $state(false);
	let refundType = $state(OrderRefundType.PRODUCTS);

	const refundedProductQuantities: RefundQuantityProps[] = order.lines
		.filter((line) => line.quantityToFulfill > 0)
		.map((line) => ({
			data: null,
			id: line.id,
			label: null,
			value: 0,
		}));

	const refundedFulfilledProductQuantities = order.fulfillments
		.filter((item) => refundFulfilledStatuses.includes(item.status))
		.reduce(
			(linesQuantity, fulfillment) =>
				linesQuantity.concat(
					(fulfillment.lines || []).map((line) => ({
						data: null,
						id: line.id,
						label: null,
						value: 0,
					})),
				),
			[] as RefundQuantityProps[],
		);

	const unfulfilledLines = order.lines.filter((line) => line.quantityToFulfill > 0);
	const fulfilledFulfillments = order.fulfillments.filter((ffm) =>
		refundFulfilledStatuses.includes(ffm.status),
	);
</script>

<Modal {open} onClose={() => (open = false)} header="Refund" size="xl">
	<div class="flex gap-2">
		<div class="w-7/10 space-y-2">
			<div class="rounded-lg border border-gray-200 p-3 space-y-2">
				<SectionHeader>Refund order</SectionHeader>
				<div class="space-y-1">
					{#each refundTypes as type, idx (idx)}
						<RadioButton value={type} label={type} bind:group={refundType} size="sm" />
					{/each}
				</div>
			</div>

			{#if refundType === OrderRefundType.PRODUCTS}
				{#if unfulfilledLines.length}
					<OrderRefundUnfulfilledProduct
						unfulfilledOrderLines={unfulfilledLines}
						{refundedProductQuantities}
					/>
				{/if}

				<OrderRefundFulfilledProduct
					{fulfilledFulfillments}
					{refundedFulfilledProductQuantities}
					orderNumber={order.number}
				/>
			{/if}
		</div>

		<div class="w-3/10 rounded-lg border border-gray-200 p-3 space-y-2">
			<SectionHeader>Refunded Amount</SectionHeader>

			{#each REFUND_AMOUNT_OPTIONS as type, idx (idx)}
				<RadioButton
					value={type}
					bind:group={amountType}
					disabled={type.disabled}
					label={type.label}
					size="sm"
				/>
			{/each}

			{#if amountType !== 'no-refund'}
				<Checkbox label="Refund shippent costs" size="sm" bind:checked={refundShipmentCosts} />
			{/if}

			{#if refundType === OrderRefundType.PRODUCTS}
				{#if amountType === 'no-refund'}
					<PaymentSubmitCardValues
						authorizedAmount={order.total.gross}
						previouslyRefunded={getPreviouslyRefundedPrice(order)}
						maxRefund={getOrderCharged(order)}
						shipmentCost={getShipmentCost(order) as Money}
					/>
				{:else if amountType === 'automatic-amount'}
					<PaymentSubmitCardValues
						authorizedAmount={order.total.gross}
						previouslyRefunded={getPreviouslyRefundedPrice(order)}
						maxRefund={getOrderCharged(order)}
						shipmentCost={getShipmentCost(order) as Money}
					
					/>
				{/if}
			{/if}

			<hr />
		</div>
	</div>
</Modal>
