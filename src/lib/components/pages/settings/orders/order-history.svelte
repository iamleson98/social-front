<script lang="ts">
	import { ORDER_ADD_NOTE_MUTATION, ORDER_HISTORY_QUERY } from '$lib/api/admin/orders';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { ArrowDown, CalendarClock, Send } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import {
		OrderEventsEnum,
		type Mutation,
		type MutationOrderAddNoteArgs,
		type Query,
		type QueryOrderArgs,
	} from '$lib/gql/graphql';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	type Props = {
		id: string;
	};

	let { id }: Props = $props();

	let newNote = $state<string>();
	let showDiscount = $state(false);
	let loading = $state(false);
	let filterType = $state<OrderEventsEnum>();

	const eventsQuery = operationStore<Pick<Query, 'order'>, QueryOrderArgs>({
		kind: 'query',
		query: ORDER_HISTORY_QUERY,
		variables: { id },
	});

	export const orderHistoryTypeToHumanize = (type?: OrderEventsEnum | null): string => {
		const map: Record<OrderEventsEnum, string> = {
			[OrderEventsEnum.AddedProducts]: 'Products were added to the order',
			[OrderEventsEnum.Canceled]: 'The order was canceled',
			[OrderEventsEnum.Confirmed]: 'The order was confirmed',
			[OrderEventsEnum.DraftCreated]: 'A draft order was created',
			[OrderEventsEnum.DraftCreatedFromReplace]: 'A draft order was created from a replacement',
			[OrderEventsEnum.EmailSent]: 'An email was sent to the customer',
			[OrderEventsEnum.Expired]: 'The order has expired',
			[OrderEventsEnum.ExternalServiceNotification]: 'Notified an external service',
			[OrderEventsEnum.FulfillmentAwaitsApproval]: 'Fulfillment is awaiting approval',
			[OrderEventsEnum.FulfillmentCanceled]: 'A fulfillment was canceled',
			[OrderEventsEnum.FulfillmentFulfilledItems]: 'Items were fulfilled',
			[OrderEventsEnum.FulfillmentRefunded]: 'Fulfillment was refunded',
			[OrderEventsEnum.FulfillmentReplaced]: 'Items were replaced',
			[OrderEventsEnum.FulfillmentRestockedItems]: 'Items were restocked',
			[OrderEventsEnum.FulfillmentReturned]: 'Items were returned',
			[OrderEventsEnum.InvoiceGenerated]: 'Invoice was generated',
			[OrderEventsEnum.InvoiceRequested]: 'Invoice was requested',
			[OrderEventsEnum.InvoiceSent]: 'Invoice was sent',
			[OrderEventsEnum.InvoiceUpdated]: 'Invoice was updated',
			[OrderEventsEnum.NoteAdded]: 'A note was added to the order',
			[OrderEventsEnum.NoteUpdated]: 'A note on the order was updated',
			[OrderEventsEnum.OrderDiscountAdded]: 'A discount was added to the order',
			[OrderEventsEnum.OrderDiscountAutomaticallyUpdated]: 'Order discount was updated automatically',
			[OrderEventsEnum.OrderDiscountDeleted]: 'Order discount was removed',
			[OrderEventsEnum.OrderDiscountUpdated]: 'Order discount was updated',
			[OrderEventsEnum.OrderFullyPaid]: 'The order was fully paid',
			[OrderEventsEnum.OrderLineDiscountRemoved]: 'Discount on an order line was removed',
			[OrderEventsEnum.OrderLineDiscountUpdated]: 'Discount on an order line was updated',
			[OrderEventsEnum.OrderLineProductDeleted]: 'A product in the order was deleted',
			[OrderEventsEnum.OrderLineVariantDeleted]: 'A product variant in the order was deleted',
			[OrderEventsEnum.OrderMarkedAsPaid]: 'Order was marked as paid',
			[OrderEventsEnum.OrderReplacementCreated]: 'A replacement order was created',
			[OrderEventsEnum.Other]: 'Other event',
			[OrderEventsEnum.OversoldItems]: 'Oversold items in order',
			[OrderEventsEnum.PaymentAuthorized]: 'Payment was authorized',
			[OrderEventsEnum.PaymentCaptured]: 'Payment was captured',
			[OrderEventsEnum.PaymentFailed]: 'Payment failed',
			[OrderEventsEnum.PaymentRefunded]: 'Payment was refunded',
			[OrderEventsEnum.PaymentVoided]: 'Payment was voided',
			[OrderEventsEnum.Placed]: 'Order was placed',
			[OrderEventsEnum.PlacedAutomaticallyFromPaidCheckout]: 'Order was automatically placed after paid checkout',
			[OrderEventsEnum.PlacedFromDraft]: 'Order was placed from a draft',
			[OrderEventsEnum.RemovedProducts]: 'Products were removed from the order',
			[OrderEventsEnum.TrackingUpdated]: 'Tracking number was updated',
			[OrderEventsEnum.TransactionCancelRequested]: 'Transaction cancel was requested',
			[OrderEventsEnum.TransactionChargeRequested]: 'Transaction charge was requested',
			[OrderEventsEnum.TransactionEvent]: 'Transaction event occurred',
			[OrderEventsEnum.TransactionMarkAsPaidFailed]: 'Marking transaction as paid failed',
			[OrderEventsEnum.TransactionRefundRequested]: 'Transaction refund was requested',
			[OrderEventsEnum.UpdatedAddress]: 'The shipping or billing address was updated',
		};

		return type ? (map[type] ?? '') : '';
	};

	const handleAddNote = async () => {
		if (!newNote) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderAddNote'>,
			MutationOrderAddNoteArgs
		>(ORDER_ADD_NOTE_MUTATION, {
			input: {
				message: newNote,
			},
			order: id,
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(result, 'orderAddNote', 'Successfully posted new note to order')
		)
			return;

		newNote = ''; // reset note
		eventsQuery.reexecute({ context: { requestPolicy: 'network-only' }, variables: { id } });
	};
</script>

{#if $eventsQuery.fetching}
	<SelectSkeleton size="sm" label />
{:else if $eventsQuery.error}
	<Alert size="sm" variant="error" bordered>{$eventsQuery.error.message}</Alert>
{:else if $eventsQuery.data}
	{@const events =
		$eventsQuery.data.order?.events
			.filter((event) => (filterType ? event.type === filterType : true))
			.sort(
				(a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(), // latest first
			) || []}
	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<!-- MARK: note form -->
		<div class="flex gap-2 items-center">
			<div class="flex-3/4 flex items-center gap-2">
				<div class="avatar">
					<div class="w-9 rounded-lg">
						<img
							src={$READ_ONLY_USER_STORE?.avatar?.url}
							alt={$READ_ONLY_USER_STORE?.avatar?.alt}
						/>
					</div>
				</div>
				<Input
					size="sm"
					placeholder="Add note"
					class="w-full"
					bind:value={newNote}
					disabled={loading}
				/>
			</div>
			<div class="flex-1/4">
				<Button
					size="sm"
					endIcon={Send}
					fullWidth
					disabled={!newNote?.trim() || loading}
					onclick={handleAddNote}>Send</Button
				>
			</div>
		</div>

		<!-- MARK: event history -->
		<div class="relative w-full mx-auto dark:bg-gray-900 mt-5">
			<ol class="relative mt-2 ml-5 border-s border-gray-200 dark:border-gray-700">
				{#each events as event, idx (idx)}
					{@const discount = event.discount}
					{@const byName =
						event.user?.firstName || event.user?.lastName
							? `${event.user.firstName || ''} ${event.user.lastName || ''}`
							: event.user?.email}
					<li class="mb-4 ms-6 flex flex-row gap-7">
						<IconButton
							icon={CalendarClock}
							size="xs"
							variant="light"
							color="orange"
							class="absolute! -start-3.5 ring-4 ring-white"
							rounded
						/>
						<div>
							<div class="mb-1 font-medium text-sm dark:text-white text-gray-700">
								{orderHistoryTypeToHumanize(event.type)}
							</div>
							<div class="text-xs font-normal leading-none text-gray-400 dark:text-gray-500 mb-1">
								{dayjs(event.date).fromNow()}
							</div>
							{#if event.type === OrderEventsEnum.NoteAdded}
								<div class="border-l-4 border-gray-200 p-2 bg-gray-50 text-gray-600 text-sm mb-1">
									<span>{event.message}</span>
								</div>
							{/if}
							<div class="text-xs text-gray-600">
								By <a
									class="text-blue-600 text-sm font-semibold"
									href={AppRoute.SETTINGS_ORDERS_DETAILS(id)}>{byName}</a
								>
							</div>
							{#if showDiscount && discount}
								<div class="mt-2 text-sm">
									{#if discount?.amount}
										<p>Discount value: {discount.amount.amount} {discount.amount.currency}</p>
									{/if}
									{#if discount?.reason}
										<p>Reason for discount: {discount.reason}</p>
									{/if}
								</div>
							{/if}
						</div>
						{#if event.type === OrderEventsEnum.OrderDiscountAdded}
							<IconButton
								size="xs"
								variant="light"
								color="orange"
								icon={ArrowDown}
								class="w-3 h-3"
								onclick={() => (showDiscount = !showDiscount)}
							/>
						{/if}
					</li>
				{/each}
			</ol>
		</div>
	</div>
{/if}
