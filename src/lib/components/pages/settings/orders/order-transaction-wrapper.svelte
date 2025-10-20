<script lang="ts">
	import { tranFunc } from '$i18n';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Edit, Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { Table, type TableCellProps, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		OrderAction,
		OrderChargeStatusEnum,
		TransactionActionEnum,
		type Money,
		type Order,
		type TransactionEvent,
	} from '$lib/gql/graphql';
	import { CommonEaseDatePickerFormat, SitenameTimeFormat } from '$lib/utils/consts';
	import { paymentStatusBadgeClass, SitenameCommonClassName } from '$lib/utils/utils';
	import {
		extractOrderGiftCardUsedAmount,
		getDeliveryMethodName,
		getDiscountTypeLabel,
		getTaxTypeText,
		getShouldDisplayAmounts,
		getRefundState,
		prepareOrderRefundDisplayList,
		type OrderRefundDisplay,
		canEditRefund,
	} from './utils';
	import dayjs from 'dayjs';

	type Props = {
		order: Order;
	};

	let { order }: Props = $props();

	const FilteredPayments = order.payments.filter(
		(payment) => payment.isActive || !!payment.transactions?.length,
	);
	let openCaptureTransactionModal = $state(false);
	const hasAnyTransactions =
		!!order.transactions.length || !!FilteredPayments.length || !!order.giftCards.length;

	const RefundState = $derived(getRefundState(order.transactions));
	const RefundTooltip = $derived.by(() => {
		if (RefundState === 'noTransactionsToRefund') return 'No transaction to refund';
		if (RefundState === 'allTransactionsNonRefundable')
			return 'All transactions are non refundable';
		return '';
	});
	const MergedRefunds = prepareOrderRefundDisplayList(
		order.transactions.flatMap((t) => t.events),
		order.grantedRefunds,
	);

	const RefundColumns: TableColumnProps<OrderRefundDisplay>[] = [
		{
			title: 'Status',
			child: refundStatus,
		},
		{
			title: 'Amount',
			child: refundAmount,
		},
		{
			title: 'Reason',
			child: refundReason,
		},
		{
			title: 'User',
			child: refundUser,
		},
		{
			title: 'Date',
			child: refundDate,
		},
		{
			title: 'Edit',
			child: refundEdit,
		},
	];

	const TransactionEventsColumns: TableColumnProps<TransactionEvent>[] = [
		{
			title: '',
			child: eventStatus,
		},
		{
			title: '',
			child: eventAmount,
		},
		{
			title: '',
			child: eventMessage,
		},
		{
			title: '',
			child: eventPspReference,
		},
		{
			title: '',
			child: eventCreatedAt,
		},
		{
			title: '',
			child: eventCreatedBy,
		},
	];
</script>

{#snippet eventStatus({ item }: TableCellProps<TransactionEvent>)}
	<Badge text={item.type || '-'} size="xs" rounded />
{/snippet}

{#snippet eventCreatedAt({ item }: TableCellProps<TransactionEvent>)}
	<div class="text-xs">{dayjs(item.createdAt).format(SitenameTimeFormat)}</div>
{/snippet}

{#snippet eventCreatedBy({ item }: TableCellProps<TransactionEvent>)}
	{#if item.createdBy?.__typename === 'User'}
		<Thumbnail
			src={item.createdBy.avatar?.url}
			alt={item.createdBy.email}
			size="xs"
			radius="rounded-full"
		/>
	{/if}
{/snippet}

{#snippet eventPspReference({ item }: TableCellProps<TransactionEvent>)}
	{item.pspReference}
{/snippet}

{#snippet eventMessage({ item }: TableCellProps<TransactionEvent>)}
	{item.message}
{/snippet}

{#snippet eventAmount({ item }: TableCellProps<TransactionEvent>)}
	<PriceDisplay {...item.amount} />
{/snippet}

{#snippet refundStatus({ item }: TableCellProps<OrderRefundDisplay>)}
	<Badge text={item.status} />
{/snippet}

{#snippet refundAmount({ item }: TableCellProps<OrderRefundDisplay>)}
	<PriceDisplay {...item.amount} />
{/snippet}

{#snippet refundReason({ item }: TableCellProps<OrderRefundDisplay>)}
	<div>
		{#if !item.reasonType && !item.reasonNote}
			<div>Manual refund</div>
		{/if}
		{#if item.reasonType}
			<div>{item.reasonType}</div>
		{/if}
		<div>{item.reasonNote}</div>
	</div>
{/snippet}

{#snippet refundUser({ item }: TableCellProps<OrderRefundDisplay>)}
	<Thumbnail
		alt={item.user?.email || item.user?.firstName || item.user?.lastName || ''}
		size="sm"
	/>
{/snippet}

{#snippet refundDate({ item }: TableCellProps<OrderRefundDisplay>)}
	{dayjs(item.createdAt).format(CommonEaseDatePickerFormat)}
{/snippet}

{#snippet OrderSummaryLine(text: string, money: Money, subText?: string)}
	<div class="flex items-start justify-between text-gray-700">
		<div>
			<div class="text-sm">{text}</div>
			{#if subText}
				<div class="text-xs">{subText}</div>
			{/if}
		</div>

		<PriceDisplay {...money} />
	</div>
{/snippet}

{#snippet refundEdit({ item }: TableCellProps<OrderRefundDisplay>)}
	{#if canEditRefund(item)}
		<Button size="sm" endIcon={Edit} class="tooltip tooltip-top" data-tip="Edit refund" />
	{:else}
		<Button disabled>Edit</Button>
	{/if}
{/snippet}

{#snippet OrderSummaryCard(order: Order)}
	{@const giftcardAmount = extractOrderGiftCardUsedAmount(order)}
	<div class={SitenameCommonClassName}>
		<SectionHeader>Order Summary</SectionHeader>
		{@render OrderSummaryLine('Subtotal', order.subtotal.gross)}
		{@render OrderSummaryLine(
			'Shipping',
			order.shippingPrice.gross,
			getDeliveryMethodName(order, $tranFunc),
		)}
		{@render OrderSummaryLine('Taxes', order.total.tax, getTaxTypeText(order, $tranFunc))}

		{#each order.discounts as discount, idx (idx)}
			{@render OrderSummaryLine(
				'Discount',
				discount.amount,
				getDiscountTypeLabel(discount, $tranFunc),
			)}
		{/each}
		{#if giftcardAmount && giftcardAmount > 0 && order.giftCards.length}
			{@render OrderSummaryLine('Gift card', {
				amount: giftcardAmount,
				currency: order.total.gross.currency,
			})}
		{/if}

		<div class="h-[1px] bg-gray-200"></div>

		{@render OrderSummaryLine('Total', order.total.gross)}
	</div>
{/snippet}

{#snippet OrderPaymentSummaryCard(order: Order)}
	{@const giftCardAmount = extractOrderGiftCardUsedAmount(order)}
	{@const canGrantRefund = order.transactions.length > 0 || order.payments.length > 0}
	{@const canSendRefund = order.grantedRefunds.length > 0}
	{@const canAnyRefund = canGrantRefund || canSendRefund}
	{@const hasGiftCards = typeof giftCardAmount === 'number' && giftCardAmount > 0}
	{@const canMarkAsPaid = order.actions.includes(OrderAction.MarkAsPaid)}
	{@const shouldDisplay = getShouldDisplayAmounts(order)}
	{@const showHasNoPayment =
		!canAnyRefund && !shouldDisplay.charged && !shouldDisplay.authorized && !hasGiftCards}

	<div class={SitenameCommonClassName}>
		<SectionHeader>
			<div>Payment Summary</div>
			{#if order.chargeStatus === OrderChargeStatusEnum.Overcharged}
				<Badge size="sm" variant="filled" color="orange" text="Overcharged" rounded />
			{:else}
				<Badge {...paymentStatusBadgeClass(order.paymentStatus)} rounded />
			{/if}
		</SectionHeader>
		<div class="text-xs">A summary of all payments from registered transactions</div>
		{#if showHasNoPayment}
			<div class="font-semibold">This order has no payment yet.</div>

			{#if canMarkAsPaid}
				<Button>Mark as paid</Button>
			{/if}
		{:else}
			{@render OrderSummaryLine('Authorized', order.totalAuthorized)}
			{#if shouldDisplay.authorizedPending}
				{@render OrderSummaryLine('Authorized', order.totalAuthorizePending, 'Pending')}
			{/if}
			{@render OrderSummaryLine('Captured', order.totalCharged)}
			{#if shouldDisplay.chargedPending}
				{@render OrderSummaryLine('Captured', order.totalChargePending, 'Pending')}
			{/if}
			{@render OrderSummaryLine('Cancelled', order.totalCanceled)}
			{#if shouldDisplay.cancelledPending}
				{@render OrderSummaryLine('Cancelled', order.totalCancelPending, 'Pending')}
			{/if}
		{/if}
	</div>
{/snippet}

{#snippet MoneyWithTitle(amount: Money, title: string)}
	<div class="text-sm text-gray-600">
		<div>{title}</div>
		<PriceDisplay {...amount} />
	</div>
{/snippet}

{#snippet OrderTransactions(order: Order)}
	{#each order.transactions as transaction, idx (idx)}
		{@const actions = transaction.actions.filter((act) => act !== TransactionActionEnum.Refund)}
		<div>
			<div class="flex items-center justify-between">
				<!-- MARK: title -->
				<div class="text-sm font-medium">
					<svelte:element
						this={transaction.externalUrl ? 'a' : 'div'}
						href={transaction.externalUrl}
						class="inline-block"
					>
						Transaction #{idx + 1} on {dayjs(transaction.createdAt).format(SitenameTimeFormat)}
					</svelte:element>
					{#if transaction.name}
						<div class="tet-xs text-gray-500">
							{transaction.name}
						</div>
					{/if}
				</div>

				<div class="flex items-center justify-between gap-2">
					{#if transaction.cancelPendingAmount.amount > 0}
						{@render MoneyWithTitle(transaction.cancelPendingAmount, 'Cancel pending')}
					{/if}
					{#if transaction.canceledAmount.amount > 0}
						{@render MoneyWithTitle(transaction.canceledAmount, 'Cancel')}
					{/if}
					{#if transaction.refundPendingAmount.amount > 0}
						{@render MoneyWithTitle(transaction.refundPendingAmount, 'Refund pending')}
					{/if}
					{#if transaction.refundedAmount.amount > 0}
						{@render MoneyWithTitle(transaction.refundedAmount, 'Refunded')}
					{/if}
					{#if transaction.chargePendingAmount.amount > 0}
						{@render MoneyWithTitle(transaction.chargePendingAmount, 'Charged pending')}
					{/if}
					{#if transaction.chargedAmount.amount > 0}
						{@render MoneyWithTitle(transaction.chargedAmount, 'Charged')}
					{/if}
					{#if transaction.authorizePendingAmount.amount > 0}
						{@render MoneyWithTitle(transaction.authorizePendingAmount, 'Authorized pending')}
					{/if}
					{#if transaction.authorizedAmount.amount > 0}
						{@render MoneyWithTitle(transaction.authorizedAmount, 'Authorized')}
					{/if}

					{#if actions.length}
						<div class="flex items-center gap-1">
							{#each actions as action, idx (idx)}
								<Button size="xs" color="gray">{action}</Button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<Table items={transaction.events} headless columns={TransactionEventsColumns} />
		</div>
	{/each}
{/snippet}

<div class="grid grid-cols-2 gap-2">
	{@render OrderSummaryCard(order)}
	{@render OrderPaymentSummaryCard(order)}
</div>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Refunds</div>

		<Button
			endIcon={Plus}
			size="xs"
			color="gray"
			class="tooltip tooltip-top"
			disabled={RefundState !== 'refundable'}
			data-tip={RefundTooltip}>New refund</Button
		>
	</SectionHeader>

	{#if !MergedRefunds.length}
		<Alert size="sm">There are no refunds for this order</Alert>
	{:else}
		<Table columns={RefundColumns} items={MergedRefunds} />
	{/if}
</div>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Transactions</div>
		<Button
			size="xs"
			color="gray"
			endIcon={Plus}
			onclick={() => (openCaptureTransactionModal = true)}>Add transaction</Button
		>
	</SectionHeader>

	{@render OrderTransactions(order)}
</div>

<Modal size="xs" open={openCaptureTransactionModal} header="Capture manual transaction">
	<div class="space-y-2">
		<Alert size="xs">Create a manual transaction for non-integrated payments</Alert>
		<Input label="Description" required size="sm" placeholder="description" />
		<Input label="Psp reference" size="sm" placeholder="psp reference" />
		<Input label="Amount" required size="sm" type="number">
			{#snippet action()}
				<span class="text-[10px] font-bold">{order.channel.currencyCode}</span>
			{/snippet}
		</Input>
	</div>
</Modal>
