<script lang="ts">
	import { operationStore } from '$lib/api/operation';
	import {
	FulfillmentStatus,
		type Mutation,
		type MutationOrderUpdateArgs,
		type OrderUpdateInput,
		type Query,
		type QueryOrderArgs,
	} from '$lib/gql/graphql';
	import { page } from '$app/state';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError, orderStatusBadgeClass } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { ORDER_DETAIL_QUERY, ORDER_UPDATE_MUTATION } from '$lib/api/admin/orders';
	import DetailOrderSkeleton from '$lib/components/pages/settings/orders/detail-order-skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import OrderFulfillment from '$lib/components/pages/settings/orders/order-fulfillment.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import OrderPaymentBalance from '$lib/components/pages/settings/orders/order-payment-balance.svelte';
	import UserAddressOrder from '$lib/components/pages/settings/orders/user-address-order.svelte';
	import OrderHistory from '$lib/components/pages/settings/orders/order-history.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import dayjs from 'dayjs';
	import OrderLines from '$lib/components/pages/settings/orders/order-lines.svelte';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { differenceBy } from 'es-toolkit/compat';
	import { Button } from '$lib/components/ui';
	import { TextArea } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import OrderRefundFulfilledProduct from '$lib/components/pages/settings/orders/refund/order-refund-fulfilled_product.svelte';
	import OrderRefundUnfulfilledProduct from '$lib/components/pages/settings/orders/refund/order-refund-unfulfilled_product.svelte';
	import RefundAmount from '$lib/components/pages/settings/orders/refund/refund-amount.svelte';

	let loading = $state(false);
	let performUpdateMetadata = $state(false);
	let openRefundModal = $state(false);

	const orderQuery = operationStore<Pick<Query, 'order'>, QueryOrderArgs>({
		kind: 'query',
		query: ORDER_DETAIL_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
	});

	let orderUpdateInput = $state<OrderUpdateInput>({});

	onMount(() =>
		orderQuery.subscribe((result) => {
			if (!result.data?.order) return;

			const { billingAddress, totalBalance, metadata, privateMetadata } = result.data.order;

			orderUpdateInput = {};
		}),
	);

	const reexecuteQuery = () =>
		orderQuery.reexecute({
			variables: { id: page.params.id },
			context: { requestPolicy: 'network-only' },
		});

	const onUpdateClick = async () => {
		loading = true;
		performUpdateMetadata = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderUpdate'>,
			MutationOrderUpdateArgs
		>(ORDER_UPDATE_MUTATION, { id: page.params.id, input: orderUpdateInput });

		loading = false;

		if (!checkIfGraphqlResultHasError(result, 'orderUpdate', 'Order updated successfully')) {
			reexecuteQuery();
		}
	};
</script>

{#if $orderQuery.fetching}
	<DetailOrderSkeleton />
{:else if $orderQuery.error}
	<Alert variant="error" size="sm" bordered>{$orderQuery.error?.message}</Alert>
{:else if $orderQuery.data?.order}
	{@const { order } = $orderQuery.data}
	{@const unfulfilledOrderLines = differenceBy(
		order.lines,
		order.fulfillments
			.filter((item) => item.status === FulfillmentStatus.Fulfilled)
			.flatMap((item) => item.lines || [])
			.map((item) => item.orderLine)
			.filter(Boolean),
		(item) => item?.id,
	)}
	<div class="flex flex-row gap-2">
		<div class="flex flex-col gap-2 w-7/10">
			<SectionHeader>
				<div class="flex items-center gap-2">
					<div>Order #{order.number}</div>
					<Badge {...orderStatusBadgeClass(order.status)} rounded />
					<div class="text-xs text-gray-500 font-medium">
						{dayjs(order.created).format(SitenameTimeFormat)}
					</div>
				</div>
			</SectionHeader>

			{#if unfulfilledOrderLines.length}
				<OrderLines orderLines={unfulfilledOrderLines} {order} onFulfillSuccess={reexecuteQuery} />
			{/if}

			{#if order.fulfillments.length}
				<OrderFulfillment {order} onUpdateTrackingCode={reexecuteQuery} />
			{/if}
			<OrderPaymentBalance {order} />
			<GeneralMetadataEditor
				metadata={order.metadata}
				privateMetadata={order.privateMetadata}
				objectId={order.id}
				disabled={loading}
				bind:performUpdateMetadata
			/>
			<OrderHistory id={order.id} />
		</div>

		<div class="flex flex-col gap-2 w-3/10">
			<div class="bg-white rounded-lg border border-gray-200 p-3">
				<SectionHeader>Customer</SectionHeader>
				<p class="text-sm">{order.userEmail || '-'}</p>
				{#if order.user}
					<a
						class="link text-sm text-blue-500"
						href={AppRoute.SETTINGS_CONFIGS_USER_DETAILS(order.user?.id)}>View profile</a
					>
				{/if}
			</div>

			<UserAddressOrder
				shippingAddress={order.shippingAddress}
				billingAddress={order.billingAddress}
			/>

			<div class="bg-white rounded-lg border border-gray-200 p-3">
				<SectionHeader>Sales channel</SectionHeader>
				<a
					class="link text-blue-500 text-sm"
					href={AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(order.channel.slug)}
				>
					<span>{order.channel.name}</span>
					<span class="text-xs">({order.channel.currencyCode})</span>
				</a>
			</div>

			<div class="bg-white rounded-lg border border-gray-200 p-3">
				<SectionHeader>
					<span>Invoices</span>
					<Button size="xs" variant="light">Generate</Button>
				</SectionHeader>
				{#if order.invoices.length}
					{#each order.invoices as invoice, idx (idx)}
						<div>{invoice.number}</div>
					{/each}
				{:else}
					<Alert size="xs" bordered>No invoice to show</Alert>
				{/if}
			</div>

			<div class="bg-white rounded-lg border border-gray-200 p-3">
				<SectionHeader>Customer note</SectionHeader>
				{#if order.customerNote}
					<TextArea readonly value={order.customerNote} />
				{:else}
					<Alert size="xs" bordered>This order has no customer note</Alert>
				{/if}
			</div>
		</div>
	</div>

	<Modal open={openRefundModal} onClose={() => (openRefundModal = false)} header="Refund">
		<div>
			{#if hasFulfillmentLines}
				<OrderRefundFulfilledProduct {order} />
			{/if}
		</div>
		<RefundAmount {order} />
	</Modal>

	<ActionBar backButtonUrl={AppRoute.SETTINGS_ORDERS()} {onUpdateClick} disabled={loading} />
{/if}
