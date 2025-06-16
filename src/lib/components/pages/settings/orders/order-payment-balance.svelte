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
	import Money from '$lib/components/pages/checkout/money.svelte';
	import {
		extractRefundedAmount,
		extractOrderGiftCardUsedAmount,
		getDiscountAmount,
	} from '$lib/components/pages/settings/orders/utils';
	import { paymentStatusBadgeClass } from '$lib/utils/utils';
	import { tranFunc } from '$i18n';

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

	const getDeliveryMethodName = () => {
		if (!order.shippingMethodName && !order.shippingPrice && !order.collectionPointName) {
			return '';
		}

		if (!order.shippingMethodName) {
			if (!order.collectionPointName) {
				return $tranFunc('payment.shippingDoesNotApply');
			}
			return $tranFunc('payment.clickAndCollectShippingMethod');
		}

		return order.shippingMethodName;
	};

	function getDiscountTypeLabel(discount: OrderDiscount) {
		if (discount.type === OrderDiscountType.Manual) {
			return $tranFunc('payment.includedInPrices');
		}
		return $tranFunc('payment.includedInSubtotal');
	}
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3 space-y-4">
	<SectionHeader>
		<div class="flex items-center gap-2">
			<span>{$tranFunc('payment.paymentTitle')}</span>
			<Badge {...paymentStatusBadgeClass(order.paymentStatus)} />
		</div>
		<div
			class="flex gap-2"
			class:invisible={!order.paymentStatus || order.status === OrderStatus.Canceled}
		>
			{#if canCapture}
				<Button size="sm" onclick={onCapture}>{$tranFunc('payment.capture')}</Button>
			{/if}
			{#if canRefund}
				<Button size="sm" onclick={onRefund}>{$tranFunc('payment.refund')}</Button>
			{/if}
			{#if canVoid}
				<Button size="sm" onclick={onVoid}>{$tranFunc('payment.void')}</Button>
			{/if}
			{#if canMarkAsPaid}
				<Button size="sm" onclick={onMarkAsPaid}>{$tranFunc('payment.markAsPaid')}</Button>
			{/if}
		</div>
	</SectionHeader>

	<!-- Discount -->
	{#each order.discounts as discount (discount.id)}
		<div class="flex justify-between text-sm text-gray-500">
			<div class="flex gap-2">
				<span>{$tranFunc('payment.discount')}</span>
				<span>{$tranFunc(getDiscountTypeLabel(discount))}</span>
				<span>({$tranFunc('payment.includedInSubtotal')})</span>
			</div>
			<Money money={getDiscountAmount(discount.amount)} ariaLabel="Discount" />
		</div>
	{/each}

	<!-- Subtotal -->
	<div class="flex justify-between items-center">
		<span>{$tranFunc('payment.subtotal')}</span>
		{#if order.subtotal?.gross}
			<Money money={order.subtotal.gross} ariaLabel="Subtotal" />
		{:else}
			<span>-</span>
		{/if}
	</div>

	<!-- Shipping -->
	<div class="flex justify-between items-center">
		<div class="flex flex-row gap-5 items-center">
			<span>{$tranFunc('payment.shipping')}</span>
			<small class="text-gray-500">{getDeliveryMethodName()}</small>
		</div>
		{#if order.shippingPrice?.gross}
			<Money money={order.shippingPrice.gross} ariaLabel="Shipping" />
		{:else}
			<span>-</span>
		{/if}
	</div>

	<!-- Taxes -->
	<div class="flex justify-between items-center">
		<div>
			<span>{$tranFunc('payment.taxes')}</span>
			{#if order.total.tax.amount > 0}
				<small class="text-gray-500 ml-2">{$tranFunc('payment.includedInPrices')}</small>
			{/if}
		</div>
		{#if order.total.tax}
			<Money money={order.total.tax} ariaLabel="Taxes" />
		{:else}
			<span>-</span>
		{/if}
	</div>

	<!-- Total -->
	<div class="flex justify-between items-center font-semibold border-t pt-2">
		<span>{$tranFunc('payment.total')}</span>
		{#if order.total?.gross}
			<Money money={order.total.gross} ariaLabel="Total" />
		{:else}
			<span>-</span>
		{/if}
	</div>

	<!-- Gift cards -->
	{#if usedGiftCardAmount && order.giftCards}
		<div class="flex justify-between items-center mt-4">
			<div>
				{#each order.giftCards as card}
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
	<div class="flex justify-between items-center">
		<span>{$tranFunc('payment.preauthorized')}</span>
		{#if order.totalAuthorized}
			<Money money={order.totalAuthorized} ariaLabel="Total authorized" />
		{:else}
			<span>-</span>
		{/if}
	</div>

	<!-- Captured -->
	<div class="flex justify-between items-center">
		<span>{$tranFunc('payment.captured')}</span>
		{#if order.totalCharged}
			<Money money={order.totalCharged} ariaLabel="Total captured" />
		{:else}
			<span>-</span>
		{/if}
	</div>

	<!-- Refunded -->
	{#if refundedAmount?.amount}
		<div class="flex justify-between items-center">
			<span>{$tranFunc('payment.refunded')}</span>
			<Money money={refundedAmount} ariaLabel="Refunded" />
		</div>
	{/if}

	<!-- Outstanding -->
	<div
		class="flex justify-between items-center font-semibold border-t pt-2"
		class:text-green-600={order.totalBalance?.amount === 0}
	>
		<span>{$tranFunc('payment.outstanding')}</span>
		{#if order.totalBalance?.amount === 0}
			<span>{$tranFunc('payment.settled')}</span>
		{:else}
			<Money money={order.totalBalance} ariaLabel="Total balance" />
		{/if}
	</div>
</div>
