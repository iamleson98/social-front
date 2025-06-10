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
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
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

	let loading = $state(false);
	let performUpdateMetadata = $state(false);

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

	const onUpdateClick = async () => {
		loading = true;
		performUpdateMetadata = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderUpdate'>,
			MutationOrderUpdateArgs
		>(ORDER_UPDATE_MUTATION, { id: page.params.id, input: orderUpdateInput });

		loading = false;

		if (!checkIfGraphqlResultHasError(result, 'orderUpdate', 'Order updated successfully')) {
			orderQuery.reexecute({
				variables: { id: page.params.id },
				context: { requestPolicy: 'network-only' },
			});
		}
	};
</script>

{#if $orderQuery.fetching}
	<DetailOrderSkeleton />
{:else if $orderQuery.error}
	<Alert variant="error" size="sm" bordered>{$orderQuery.error?.message}</Alert>
{:else if $orderQuery.data?.order}
	{@const { order } = $orderQuery.data}
	<div class="flex flex-row gap-2">
		<div class="flex flex-col gap-2 w-7/10">
			<OrderFulfillment {order} />
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
				<p>{order.userEmail}</p>
				<p class="text-blue-500 text-sm underline cursor-pointer">View profile</p>
			</div>

			<UserAddressOrder
				shippingAddresses={order.shippingAddress ? [order.shippingAddress] : []}
				billingAddress={order.billingAddress ? [order.billingAddress] : []}
			/>
		</div>
	</div>

	<ActionBar backButtonUrl={AppRoute.SETTINGS_ORDERS()} {onUpdateClick} disabled={loading} />
{/if}
