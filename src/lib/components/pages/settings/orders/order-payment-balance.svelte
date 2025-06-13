<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/Button/Button.svelte';
	import {
		OrderAction,
		OrderDiscountType,
		OrderStatus,
		type Order,
		type OrderDiscount,
	} from '$lib/gql/graphql';
	import {
		orderPaymentMessages,
		paymentButtonMessages,
	} from '$lib/components/pages/settings/orders/message';
	import Money from '../../checkout/money.svelte';
	import InputSkeleton from '$lib/components/ui/Input/input-skeleton.svelte';
	import {
		extractRefundedAmount,
		extractOrderGiftCardUsedAmount,
		obtainUsedGiftcards,
		getDiscountAmount,
	} from '$lib/components/pages/settings/orders/utils';
	import { paymentStatusBadgeClass } from '$lib/utils/utils';

	type Props = {
		order: Order;
		onCapture?: () => void;
		onMarkAsPaid?: () => void;
		onRefund?: () => void;
		onVoid?: () => void;
	};

	let { order, onCapture, onMarkAsPaid, onRefund, onVoid }: Props = $props();

	const canCapture = order.actions?.includes(OrderAction.Capture);
	const canVoid = order.actions?.includes(OrderAction.Void);
	const canRefund = order.actions?.includes(OrderAction.Refund);
	const canMarkAsPaid = order.actions?.includes(OrderAction.MarkAsPaid);

	const refundedAmount = extractRefundedAmount(order);
	const usedGiftCardAmount = extractOrderGiftCardUsedAmount(order);
	const usedGiftcards = obtainUsedGiftcards(order);

	const getDeliveryMethodName = () => {
		if (!order.shippingMethodName && !order.shippingPrice && !order.collectionPointName) {
			return '';
		}

		if (order.shippingMethodName === null) {
			if (order.collectionPointName === null) {
				return orderPaymentMessages.shippingDoesNotApply;
			}
			return orderPaymentMessages.clickAndCollectShippingMethod;
		}

		return order.shippingMethodName;
	};

	function getDiscountTypeLabel(discount: OrderDiscount) {
		if (discount.type === OrderDiscountType.Manual) {
			return orderPaymentMessages.includedInPrices;
		}
		return orderPaymentMessages.includedInSubtotal;
	}
</script>

<div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
	<SectionHeader>
		<div class="flex items-center gap-2">
			<span>{orderPaymentMessages.paymentTitle}</span>
			<Badge {...paymentStatusBadgeClass(order.paymentStatus)} />
		</div>
		<div
			class="flex gap-2 ml-auto"
			class:invisible={!order.paymentStatus || order.status === OrderStatus.Canceled}
		>
			{#if canCapture}
				<Button size="sm" onclick={onCapture}>{paymentButtonMessages.capture}</Button>
			{/if}
			{#if canRefund}
				<Button size="sm" onclick={onRefund}>{paymentButtonMessages.refund}</Button>
			{/if}
			{#if canVoid}
				<Button size="sm" onclick={onVoid}>{paymentButtonMessages.void}</Button>
			{/if}
			{#if canMarkAsPaid}
				<Button size="sm" onclick={onMarkAsPaid}>{paymentButtonMessages.markAsPaid}</Button>
			{/if}
		</div>
	</SectionHeader>

	<!-- Discount -->
	{#each order.discounts ?? [] as discount (discount.id)}
		<div class="flex justify-between text-sm text-gray-500">
			<div class="flex gap-2">
				<span>{orderPaymentMessages.discount}</span>
				<span>{getDiscountTypeLabel(discount)}</span>
				<span>({orderPaymentMessages.includedInSubtotal})</span>
			</div>
			<Money money={getDiscountAmount(discount.amount)} ariaLabel="Discount" />
		</div>
	{/each}

	<!-- Subtotal -->
	<div class="flex justify-between">
		<span>{orderPaymentMessages.subtotal}</span>
		{#if order.subtotal?.gross}
			<Money money={order.subtotal.gross} ariaLabel="Subtotal" />
		{:else}
			<InputSkeleton />
		{/if}
	</div>

	<!-- Shipping -->
	<div class="flex justify-between">
		<div class="flex flex-row gap-5 items-center">
			<span>{orderPaymentMessages.shipping}</span>
			<small class="text-gray-500">{getDeliveryMethodName()}</small>
		</div>
		{#if order.shippingPrice?.gross}
			<Money money={order.shippingPrice.gross} ariaLabel="Shipping" />
		{:else}
			<InputSkeleton />
		{/if}
	</div>

	<!-- Taxes -->
	<div class="flex justify-between">
		<div>
			<span>{orderPaymentMessages.taxes}</span>
			{#if order.total.tax.amount > 0}
				<small class="text-gray-500 ml-2">{orderPaymentMessages.includedInPrices}</small>
			{/if}
		</div>
		{#if order.total.tax}
			<Money money={order.total.tax} ariaLabel="Taxes" />
		{:else}
			<InputSkeleton />
		{/if}
	</div>

	<!-- Total -->
	<div class="flex justify-between font-semibold border-t pt-2">
		<span>{orderPaymentMessages.total}</span>
		{#if order.total?.gross}
			<Money money={order.total.gross} ariaLabel="Total" />
		{:else}
			<InputSkeleton />
		{/if}
	</div>

	<!-- Divider -->
	<hr class="my-4" />

	<!-- Gift cards -->
	{#if usedGiftCardAmount && usedGiftcards}
		<div class="flex justify-between text-sm">
			<div>
				{#each usedGiftcards as card}
					<div>Gift card: {card.displayCode}</div>
				{/each}
			</div>
			<Money
				money={{ amount: usedGiftCardAmount, currency: order.total?.gross?.currency }}
				ariaLabel="Gift card"
			/>
		</div>
	{/if}

	<!-- Total Authorized -->
	<div class="flex justify-between">
		<span>{orderPaymentMessages.preauthorized}</span>
		{#if order.totalAuthorized}
			<Money money={order.totalAuthorized} ariaLabel="Total authorized" />
		{:else}
			<InputSkeleton />
		{/if}
	</div>

	<!-- Captured -->
	<div class="flex justify-between">
		<span>{orderPaymentMessages.captured}</span>
		{#if order.totalCaptured}
			<Money money={order.totalCaptured} ariaLabel="Total captured" />
		{:else}
			<InputSkeleton />
		{/if}
	</div>

	<!-- Refunded -->
	{#if refundedAmount?.amount}
		<div class="flex justify-between">
			<span>{orderPaymentMessages.refunded}</span>
			<Money money={refundedAmount} ariaLabel="Refunded" />
		</div>
	{/if}

	<!-- Outstanding -->
	<div
		class="flex justify-between font-semibold border-t pt-2"
		class:text-green-600={order.totalBalance?.amount === 0}
	>
		<span>{orderPaymentMessages.outstanding}</span>
		{#if order.totalBalance?.amount === 0}
			<span>{orderPaymentMessages.settled}</span>
		{:else}
			<Money money={order.totalBalance} ariaLabel="Total balance" />
		{/if}
	</div>
</div>
