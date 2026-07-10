<script lang="ts">
	import { T } from '$i18n';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import {
		extractRefundedAmount,
		extractOrderGiftCardUsedAmount,
	} from '$lib/components/pages/settings/orders/utils';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import Button from '$lib/components/ui/Button/Button.svelte';
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { OrderAction, OrderDiscountType, OrderStatus, type Order } from '$lib/gql/graphql';
	import { paymentStatusBadgeClass, SitenameCommonClassName } from '$lib/utils/utils';
	import OrderMarkAsPaidModal from './order-mark-as-paid-modal.svelte';
	import OrderRefundModal from './order-refund-modal.svelte';
	import { OrderUtilsInstance } from './utils.svelte';
	import { toast } from 'svelte-sonner';

	type Props = {
		order: Order;
		onCapture?: () => void;
		onMarkAsPaid?: () => void;
		onRefund?: () => void;
		onVoid?: () => void;
		onRefetchOrder: () => void;
	};

	let { order, onCapture, onMarkAsPaid, onVoid, onRefetchOrder }: Props = $props();

	const refundedAmount = extractRefundedAmount(order);
	const usedGiftCardAmount = extractOrderGiftCardUsedAmount(order);

	let openRefundModal = $state(false);

	let openMarkAsPaidModal = $state(false);
	let markAsPaidReferenceTransaction = $state<string>();

	let deliveryMethodName = $derived.by(() => {
		if (!order.shippingMethodName && !order.shippingPrice && !order.collectionPointName) {
			return '';
		}

		if (!order.shippingMethodName) {
			if (!order.collectionPointName) {
				return $T('payment.shippingDoesNotApply');
			}
			return $T('payment.clickAndCollectShippingMethod');
		}

		return order.shippingMethodName;
	});
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div class="flex items-center gap-2">
			<span>{$T('payment.paymentTitle')}</span>
			<Badge {...paymentStatusBadgeClass(order.paymentStatus)} rounded />
		</div>
		{#if order.paymentStatus && order.status !== OrderStatus.Canceled && (order.actions.includes(OrderAction.Capture) || order.actions.includes(OrderAction.Refund) || order.actions.includes(OrderAction.Void) || order.actions.includes(OrderAction.MarkAsPaid))}
			<div class="flex gap-2">
				{#if order.actions.includes(OrderAction.Capture)}
					<Button size="xs" onclick={onCapture}>{$T('payment.capture')}</Button>
				{/if}
				{#if order.actions.includes(OrderAction.Refund)}
					<Button size="xs" onclick={() => (openRefundModal = true)}>
						{$T('payment.refund')}
					</Button>
				{/if}
				{#if order.actions.includes(OrderAction.Void)}
					<Button size="xs" onclick={onVoid}>{$T('payment.void')}</Button>
				{/if}
				{#if order.actions.includes(OrderAction.MarkAsPaid)}
					<Button size="xs" onclick={() => (openMarkAsPaidModal = true)}>
						{$T('payment.markAsPaid')}
					</Button>
				{/if}
			</div>
		{/if}
	</SectionHeader>

	<div class="text-sm space-y-1.5 text-gray-700">
		<!-- Discount -->
		{#each order.discounts as discount (discount.id)}
			<div class="flex justify-between">
				<div class="flex gap-2">
					<span>{$T('payment.discount')}</span>
					<span>
						{$T(
							discount.type === OrderDiscountType.Manual
								? 'payment.includedInPrices'
								: 'payment.includedInSubtotal',
						)}
					</span>
				</div>
				<PriceDisplay {...discount.total} negate />
			</div>
		{/each}

		<!-- Subtotal -->
		<div class="flex justify-between items-center">
			<span>{$T('payment.subtotal')}</span>
			{#if order.subtotal?.gross}
				<PriceDisplay {...order.subtotal.gross} />
			{:else}
				<span>-</span>
			{/if}
		</div>

		<!-- Shipping -->
		<div class="flex justify-between items-center">
			<div class="flex flex-row gap-5 items-center">
				<span>{$T('payment.shipping')}</span>
				<small class="text-gray-500">{deliveryMethodName}</small>
			</div>
			{#if order.shippingPrice?.gross}
				<PriceDisplay {...order.shippingPrice.gross} />
			{:else}
				<span>-</span>
			{/if}
		</div>

		<!-- Taxes -->
		<div class="flex justify-between items-center">
			<div>
				<span>{$T('payment.taxes')}</span>
				{#if order.total.tax.amount > 0}
					<small class="text-gray-500 ml-2">{$T('payment.includedInPrices')}</small>
				{/if}
			</div>
			{#if order.total.tax}
				<PriceDisplay {...order.total.tax} />
			{:else}
				<span>-</span>
			{/if}
		</div>

		<!-- Total -->
		<div class="flex justify-between items-center font-semibold">
			<span>{$T('payment.total')}</span>
			{#if order.total?.gross}
				<PriceDisplay {...order.total.gross} />
			{:else}
				<span>-</span>
			{/if}
		</div>

		<hr />

		<!-- Gift cards -->
		{#if usedGiftCardAmount && order.giftCards}
			<div class="flex justify-between items-center mt-4">
				<div>
					{#each order.giftCards as card}
						<div>Gift card: {card.displayCode}</div>
					{/each}
				</div>
				<PriceDisplay {...order.total.gross} />
			</div>
		{/if}

		<!-- Total Authorized -->
		<div class="flex justify-between items-center">
			<span>{$T('payment.preauthorized')}</span>
			{#if order.totalAuthorized}
				<PriceDisplay {...order.totalAuthorized} />
			{:else}
				<span>-</span>
			{/if}
		</div>

		<!-- Captured -->
		<div class="flex justify-between items-center">
			<span>{$T('payment.captured')}</span>
			{#if order.totalCharged}
				<PriceDisplay {...order.totalCharged} />
			{:else}
				<span>-</span>
			{/if}
		</div>

		<!-- Refunded -->
		{#if refundedAmount?.amount}
			<div class="flex justify-between items-center">
				<span>{$T('payment.refunded')}</span>
				<PriceDisplay {...refundedAmount} />
			</div>
		{/if}

		<!-- Outstanding -->
		<div
			class="flex justify-between items-center font-semibold"
			class:text-green-600={order.totalBalance?.amount === 0}
		>
			<span>{$T('payment.outstanding')}</span>
			{#if order.totalBalance?.amount === 0}
				<span>{$T('payment.settled')}</span>
			{:else}
				<PriceDisplay {...order.totalBalance} />
			{/if}
		</div>
	</div>
</div>

<OrderRefundModal bind:open={openRefundModal} {order} />

<!-- <Modal
	header="Mark order as paid"
	size="sm"
	bind:open={openMarkAsPaidModal}
	okText={$T('common.ok')}
	cancelText={$T('common.cancel')}
	onOk={async () => {
		const ok = await OrderUtilsInstance.markAsPaid(order.id, markAsPaidReferenceTransaction);
		if (ok) {
			toast.success('Order merked as paid successfully');
			openMarkAsPaidModal = false;
			onRefetchOrder();
		}
	}}
	disableElements={OrderUtilsInstance.state.loading}
>
	<Alert size="sm" class="mb-2">
		You're going to mark this order as paid. Please provide a transaction reference using the input
		below:
	</Alert>

	<Input
		placeholder="transaction reference"
		bind:value={markAsPaidReferenceTransaction}
		label="Transaction reference"
		disabled={OrderUtilsInstance.state.loading}
	/>
</Modal> -->

<OrderMarkAsPaidModal bind:open={openMarkAsPaidModal} {order} {onRefetchOrder} />
