<script lang="ts">
	import { operationStore } from '$lib/api/operation';
	import type {
	Address,
		Mutation,
		MutationOrderUpdateArgs,
		OrderUpdateInput,
		Query,
		QueryOrderArgs,
	} from '$lib/gql/graphql';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { ORDER_DETAIL_QUERY, ORDER_UPDATE_MUTATION } from '$lib/api/admin/orders';
	import DetailOrderSkeleton from '$lib/components/pages/settings/orders/detail-order-skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import UnfulfilledOrder from '$lib/components/pages/settings/orders/unfulfilled-order.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import PaymentBalanceOrder from '$lib/components/pages/settings/orders/payment-balance-order.svelte';
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
	{@const order = $orderQuery.data.order}
	<div class="flex flex-row gap-3">
		<div class="flex flex-col gap-3 w-7/10">
			<UnfulfilledOrder orderLines={order.lines} orderStatus={order.status}/>

			<PaymentBalanceOrder {order} />

			<GeneralMetadataEditor
				metadata={[]}
				privateMetadata={[]}
				objectId={order.id}
				disabled={loading}
				bind:performUpdateMetadata
			/>

			<OrderHistory id={order.id} />
		</div>

		<div class="flex flex-col gap-3 w-3/10">
			<div class="bg-white rounded-lg border border-gray-200 p-3">
				<SectionHeader>Customer</SectionHeader>
				<p>{order.userEmail}</p>
				<p class="text-blue-500 text-sm underline cursor-pointer">View profile</p>
			</div>

			<UserAddressOrder shippingAddress={order.shippingAddress as Address} billingAddress={order.billingAddress as Address} />
		</div>
	</div>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_ORDERS()}
		onUpdateClick={onUpdateClick}
		disabled={loading}
	/>
{/if}
