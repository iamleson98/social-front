<script lang="ts">
	import { operationStore } from '$lib/api/operation';
	import {
		FulfillmentStatus,
		OrderStatus,
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
	import OrderHistory from '$lib/components/pages/settings/orders/order-history.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import dayjs from 'dayjs';
	import OrderLines from '$lib/components/pages/settings/orders/order-lines.svelte';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { differenceBy } from 'es-toolkit/compat';
	import OrderLinesAssignSection from '$lib/components/pages/settings/orders/new/order-lines-assign-section.svelte';
	import Sidebar from '$lib/components/pages/settings/orders/sidebar.svelte';

	let loading = $state(false);
	let performUpdateMetadata = $state(false);

	const orderQuery = operationStore<Pick<Query, 'order'>, QueryOrderArgs>({
		query: ORDER_DETAIL_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: page.params.id as string,
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
		<div class="space-y-2 w-7/10">
			<SectionHeader>
				<div class="flex items-center gap-2">
					<div>Order #{order.number}</div>
					<Badge {...orderStatusBadgeClass(order.status)} rounded />
					<div class="text-xs text-gray-500 font-medium">
						{dayjs(order.created).format(SitenameTimeFormat)}
					</div>
				</div>
			</SectionHeader>

			{#if order.status === OrderStatus.Draft}
				<OrderLinesAssignSection {order} onAddedVariants={reexecuteQuery} />
			{/if}
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

		<Sidebar {order} onDoneCustomerUpdate={reexecuteQuery} />
	</div>

	<ActionBar backButtonUrl={AppRoute.SETTINGS_ORDERS()} {onUpdateClick} disabled={loading} />
{/if}
