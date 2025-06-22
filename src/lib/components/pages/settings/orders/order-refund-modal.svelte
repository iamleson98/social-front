<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { RadioButton } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import type { Order } from '$lib/gql/graphql';
	import {
		getMiscellaneousAmountValues,
		getRefundProductsAmountValues,
		OrderRefundType,
		refundFulfilledStatuses,
		type RefundQuantityProps,
	} from './utils';
	import OrderRefundFulfilledProduct from './order-refund-fulfilled-product.svelte';
	import OrderRefundUnfulfilledProduct from './order-refund-unfulfilled-product.svelte';
	import PaymentSubmitCard from './payent-submit-card.svelte';

	type Props = {
		open: boolean;
		order: Order;
	};

	let { open = $bindable(), order }: Props = $props();

	const refundTypes = [OrderRefundType.PRODUCTS, OrderRefundType.MISCELLANEOUS];

	let refundType = $state(OrderRefundType.PRODUCTS);
	let refundShipmentCosts = $state(false);

	let refundedProductQuantities: RefundQuantityProps[] = $state(
		order.lines
			.filter((line) => line.quantityToFulfill > 0)
			.map((line) => ({
				data: null,
				id: line.id,
				label: null,
				value: 0,
			})),
	);

	let refundedFulfilledProductQuantities = $state(
		order.fulfillments
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
			),
	);

	const unfulfilledLines = order.lines.filter((line) => line.quantityToFulfill > 0);
	const fulfilledFulfillments = order.fulfillments.filter((ffm) =>
		refundFulfilledStatuses.includes(ffm.status),
	);
</script>

<Modal
	{open}
	onClose={() => (open = false)}
	header="Refund"
	size="xl"
	closeOnEscape
	closeOnOutsideClick
>
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
						bind:refundedProductQuantities
					/>
				{/if}

				<OrderRefundFulfilledProduct
					{fulfilledFulfillments}
					bind:refundedFulfilledProductQuantities
					orderNumber={order.number}
				/>
			{/if}
		</div>

		<div class="w-3/10 rounded-lg border border-gray-200 p-3 space-y-2">
			<PaymentSubmitCard
				bind:refundShipmentCosts
				disableRefundButton={false}
				isProductRefund={refundType === OrderRefundType.PRODUCTS}
				{...refundType === OrderRefundType.PRODUCTS
					? getRefundProductsAmountValues(
							order,
							refundedProductQuantities,
							refundedFulfilledProductQuantities,
							[],
							refundShipmentCosts,
						)
					: getMiscellaneousAmountValues(order)}
			/>
		</div>
	</div>
</Modal>
