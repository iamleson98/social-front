<script lang="ts">
	import { tranFunc } from '$i18n';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Edit, Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { Skeleton } from '$lib/components/ui/Skeleton';
	import { Table, type TableCellProps, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		OrderAction,
		OrderChargeStatusEnum,
		TransactionActionEnum,
		TransactionEventTypeEnum,
		type GiftCard,
		type Money,
		type Order,
		type TransactionEvent,
	} from '$lib/gql/graphql';
	import { ShopStoreManager } from '$lib/stores/shop';
	import { CommonEaseDatePickerFormat, SitenameTimeFormat } from '$lib/utils/consts';
	import { paymentStatusBadgeClass, SitenameCommonClassName } from '$lib/utils/utils';
	import OrderManualTransactionCaptureDialog from './order-manual-transaction-capture-dialog.svelte';
	import OrderMarkAsPaidModal from './order-mark-as-paid-modal.svelte';
	import OrderRefundModal from './order-refund-modal.svelte';
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
		mapPaymentToTransactionEvents,
		type FakeTransaction,
		findMethodName,
		mapOrderActionsToTransactionActions,
		getTransactionAmount,
		prepareMoney,
		type ExtendedOrderTransaction,
		type TransactionFakeEvent,
		mapTransactionEvent,
		shouldShowAmount,
		getUsedInGiftCardEvents,
		getGiftCardAmount,
	} from './utils';
	import dayjs from 'dayjs';

	type Props = {
		order: Order;
	};

	let { order }: Props = $props();

	const FilteredPayments = $derived(
		order.payments.filter((payment) => payment.isActive || !!payment.transactions?.length),
	);
	let openCaptureTransactionModal = $state(false);
	const hasAnyTransactions = $derived(
		!!order.transactions.length || !!FilteredPayments.length || !!order.giftCards.length,
	);

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
	let openMarkOrderAsPaidModal = $state(false);
	let openRefundModal = $state(false);

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

	const TransactionEventsColumns: TableColumnProps<TransactionEvent | TransactionFakeEvent>[] = [
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
			child: { render: ({ item }) => item.message },
		},
		{
			title: '',
			child: { render: ({ item }) => item.pspReference },
		},
		{
			title: '',
			child: { render: ({ item }) => dayjs(item.createdAt).format(SitenameTimeFormat) },
		},
		{
			title: '',
			child: eventCreatedBy,
		},
	];
</script>

{#snippet eventStatus({ item }: TableCellProps<TransactionEvent | TransactionFakeEvent>)}
	{@const { status } = mapTransactionEvent(item)}
	<Badge text={status || '-'} size="xs" />
{/snippet}

{#snippet eventCreatedBy({ item }: TableCellProps<TransactionEvent | TransactionFakeEvent>)}
	{#if item.createdBy?.__typename === 'User'}
		<Thumbnail
			src={item.createdBy.avatar?.url}
			alt={item.createdBy.email}
			size="xs"
			radius="rounded-full"
		/>
	{/if}
{/snippet}

{#snippet eventAmount({ item }: TableCellProps<TransactionEvent | TransactionFakeEvent>)}
	{#if shouldShowAmount(item)}
		<PriceDisplay {...item.amount!} />
	{/if}
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
				<Button size="xs" onclick={() => (openMarkOrderAsPaidModal = true)}>Mark as paid</Button>
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

{#snippet OrderTransaction(
	transaction: ExtendedOrderTransaction,
	idx: number,
	fakeEvents?: TransactionFakeEvent[],
)}
	{@const actions = transaction.actions.filter((act) => act !== TransactionActionEnum.Refund)}
	{@const events = transaction.__typename === 'FakeTransaction' ? fakeEvents : transaction.events}
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

		<Table items={events || []} headless columns={TransactionEventsColumns} />
	</div>
{/snippet}

{#snippet OrderTransactionPayments()}
	{#each FilteredPayments as payment, idx (idx)}
		{@const refunded =
			(payment.total?.amount || 0) -
			(payment.capturedAmount?.amount || 0) -
			(payment.availableCaptureAmount?.amount || 0)}
		{@const fakeEvents = mapPaymentToTransactionEvents(payment)}
		{@const transactionFromPayment: FakeTransaction = {
			id: payment.id,
			name: findMethodName(payment.gateway, $ShopStoreManager?.availablePaymentGateways || []),
			actions: mapOrderActionsToTransactionActions(payment.actions),
			pspReference: '',
			externalUrl: '',
			chargedAmount: getTransactionAmount(payment.capturedAmount, payment.total?.currency || ''),
			authorizedAmount: getTransactionAmount(payment.availableCaptureAmount, payment.total?.currency || ''),
			refundedAmount: prepareMoney(refunded, payment.total?.currency || ''),
			// Fake amounts
			refundPendingAmount: prepareMoney(0, payment.total?.currency || ''),
			canceledAmount: prepareMoney(0, payment.total?.currency || ''),
			authorizePendingAmount: prepareMoney(0, payment.total?.currency || ''),
			chargePendingAmount: prepareMoney(0, payment.total?.currency || ''),
			cancelPendingAmount: prepareMoney(0, payment.total?.currency || ''),
			createdAt: fakeEvents[0]?.createdAt,
			__typename: 'FakeTransaction',
		} as FakeTransaction}

		{@render OrderTransaction(transactionFromPayment, idx)}
	{/each}
{/snippet}

{#snippet OrderTransactionGiftCard({ order, giftCard }: { order: Order; giftCard: GiftCard })}
	{#if !giftCard || !order}
		<Skeleton class="h-8 w-full" />
	{:else}
		{@const usedInOrderEvents = getUsedInGiftCardEvents(giftCard, order.id)}
		{@const amount = getGiftCardAmount(usedInOrderEvents)}
		{#if !usedInOrderEvents.length}
			<span>-</span>
		{:else}
			{@const currency = usedInOrderEvents[0]?.balance?.currentBalance?.currency || ''}
			{@const fakeEvents = usedInOrderEvents.map<TransactionFakeEvent>((event) => ({
				message: 'Used in order',
				id: event.id,
				pspReference: event.id,
				type: TransactionEventTypeEnum.ChargeSuccess,
				reasonReference: undefined,
				createdAt: event.date,
				amount: {
					amount:
						(event.balance?.oldCurrentBalance?.amount || 0) -
						(event.balance?.currentBalance?.amount || 0),
					currency: event.balance?.currentBalance?.currency || '',
					__typename: 'Money',
				},
				mappedResult: {
					type: 'CHARGE',
					status: 'SUCCESS',
				},
				createdBy: null,
				externalUrl: undefined,
				__typename: 'TransactionFakeEvent',
			}))}
			{@const fakeTransaction = {
				id: giftCard.id,
				name: `Gift card (**** ${giftCard.last4CodeChars})`,
				actions: [],
				pspReference: giftCard.last4CodeChars,
				externalUrl: '',
				chargedAmount: prepareMoney(amount, currency),
				createdAt: fakeEvents[0].createdAt,
				// Fake amounts
				authorizedAmount: prepareMoney(0, currency),
				authorizePendingAmount: prepareMoney(0, currency),
				chargePendingAmount: prepareMoney(0, currency),
				refundedAmount: prepareMoney(0, currency),
				refundPendingAmount: prepareMoney(0, currency),
				canceledAmount: prepareMoney(0, currency),
				cancelPendingAmount: prepareMoney(0, currency),
				__typename: 'FakeTransaction',
			} as unknown as FakeTransaction}

			{@render OrderTransaction(fakeTransaction, 0, fakeEvents)}
		{/if}
	{/if}
{/snippet}

<div class="grid grid-cols-2 gap-2">
	{@render OrderSummaryCard(order)}
	{@render OrderPaymentSummaryCard(order)}
</div>

<!-- refund section -->
<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Refunds</div>

		<Button
			endIcon={Plus}
			size="xs"
			color="gray"
			class="tooltip tooltip-top"
			disabled={RefundState !== 'refundable'}
			data-tip={RefundTooltip}
			onclick={() => (openRefundModal = true)}
		>
			New refund
		</Button>
	</SectionHeader>

	{#if !MergedRefunds.length}
		<Alert size="sm">There are no refunds for this order</Alert>
	{:else}
		<Table columns={RefundColumns} items={MergedRefunds} />
	{/if}
</div>

<!-- mark as paid section -->
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

	{#each order.transactions as transaction, idx (idx)}
		{@render OrderTransaction(transaction, idx)}
	{/each}
	{@render OrderTransactionPayments()}
	{#each order.giftCards as giftCard, idx (idx)}
		{@render OrderTransactionGiftCard({ order, giftCard })}
	{/each}

	{#if !hasAnyTransactions}
		<Alert size="sm" variant="info">There are no transactions for this order</Alert>
	{/if}
</div>

<OrderManualTransactionCaptureDialog bind:open={openCaptureTransactionModal} {order} />
<OrderMarkAsPaidModal bind:open={openMarkOrderAsPaidModal} {order} />
<OrderRefundModal bind:open={openRefundModal} {order} />
