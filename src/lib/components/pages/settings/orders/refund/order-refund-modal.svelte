<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox, RadioButton } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import type { Order } from '$lib/gql/graphql';
	import { refundFulfilledStatuses, type RefundQuantityProps } from '../utils';
	import OrderRefundFulfilledProduct from './order-refund-fulfilled-product.svelte';
	import OrderRefundUnfulfilledProduct from './order-refund-unfulfilled-product.svelte';

	type Props = {
		open: boolean;
		order: Order;
	};

	let { open = $bindable(), order }: Props = $props();

	enum OrderRefundType {
		MISCELLANEOUS = 'miscellaneous',
		PRODUCTS = 'products',
	}

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

	let amountType = $state<AmountInputType>('automatic-amount');

	const refundTypes = [OrderRefundType.PRODUCTS, OrderRefundType.MISCELLANEOUS];

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

<Modal {open} onClose={() => (open = false)} header="Refund" size="lg">
	<div class="flex gap-2">
		<div class="w-3/4 space-y-2">
			<div>
				<div class="text-sm mb-1">Refund order</div>
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

		<div class="w-1/4">
			<SectionHeader>Refunded Amount</SectionHeader>

			{#each REFUND_AMOUNT_OPTIONS as type, idx (idx)}
				<RadioButton
					value={type}
					bind:group={amountType}
					disabled={type.disabled}
					label={type.label}
					size="xs"
				/>
			{/each}

			<div class="mt-2">
				<Checkbox label="Refund shippent costs" size="sm" />
			</div>

      <hr>
		</div>
	</div>
</Modal>
