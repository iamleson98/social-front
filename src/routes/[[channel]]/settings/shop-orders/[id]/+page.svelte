<script lang="ts">
	import { page } from '$app/state';
	import { ORDER_DETAIL_QUERY } from '$lib/api/admin/orders';
	import { operationStore } from '$lib/api/operation';
	import DetailOrderSkeleton from '$lib/components/pages/settings/orders/detail-order-skeleton.svelte';
	import OrderDraftDetails from '$lib/components/pages/settings/orders/draft-order-details/order-draft-details.svelte';
	import OrderFulfillment from '$lib/components/pages/settings/orders/order-fulfillment.svelte';
	import OrderNormalDetails from '$lib/components/pages/settings/orders/order-normal-details.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		OrderStatus,
		type OrderUpdateInput,
		type Query,
		type QueryOrderArgs,
	} from '$lib/gql/graphql';
	import { onMount } from 'svelte';

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

			// const { billingAddress, totalBalance, metadata, privateMetadata } = result.data.order;

			orderUpdateInput = {};
		}),
	);

	const reexecuteQuery = () =>
		orderQuery.reexecute({
			variables: { id: page.params.id },
			// context: { requestPolicy: 'network-only' },
		});

	// const onUpdateClick = async () => {
	// 	loading = true;
	// 	const result = await GRAPHQL_CLIENT.mutation<
	// 		Pick<Mutation, 'orderUpdate'>,
	// 		MutationOrderUpdateArgs
	// 	>(ORDER_UPDATE_MUTATION, { id: page.params.id, input: orderUpdateInput });

	// 	if (checkIfGraphqlResultHasError(result, 'orderUpdate')) {
	// 		loading = false;
	// 		return;
	// 	}

	// 	const hasErr = await metaRef?.handleUpdate();
	// 	loading = false;
	// 	if (hasErr) return;

	// 	toast.success($CommonState.EditSuccess);
	// 	reexecuteQuery();
	// };

	/** only draft orders can update customer */
	// const handleUpdateCustomer = async (userId: string) => {
	// 	loading = true;
	// 	const result = await GRAPHQL_CLIENT.mutation<
	// 		Pick<Mutation, 'draftOrderUpdate'>,
	// 		MutationDraftOrderUpdateArgs
	// 	>(DRAFT_ORDER_UPDATE_MUTATION, {
	// 		id: page.params.id,
	// 		input: {
	// 			user: userId,
	// 			shippingAddress: null,
	// 			billingAddress: null,
	// 		},
	// 	});
	// 	loading = false;

	// 	if (checkIfGraphqlResultHasError(result, 'draftOrderUpdate', 'Customer updated successfully'))
	// 		return;

	// 	reexecuteQuery();
	// };

	// const handleUpdateAddress = async (
	// 	type: AddressTypeEnum,
	// 	addr: AddressInput,
	// 	alsoSetForTheRest: boolean,
	// ) => {
	// 	if (!$orderQuery.data?.order) return;

	// 	const isDraftOrder = $orderQuery.data.order.status === OrderStatus.Draft;

	// 	const input: Pick<DraftOrderInput, 'billingAddress' | 'shippingAddress'> = {};
	// 	if (type === AddressTypeEnum.Billing) {
	// 		input.billingAddress = addr;
	// 		if (alsoSetForTheRest) input.shippingAddress = addr;
	// 	} else {
	// 		input.shippingAddress = addr;
	// 		if (alsoSetForTheRest) input.billingAddress = addr;
	// 	}

	// 	loading = true;
	// 	if (isDraftOrder) {
	// 		const result = await GRAPHQL_CLIENT.mutation<
	// 			Pick<Mutation, 'draftOrderUpdate'>,
	// 			MutationDraftOrderUpdateArgs
	// 		>(DRAFT_ORDER_UPDATE_MUTATION, { id: page.params.id, input });
	// 		checkIfGraphqlResultHasError(result, 'draftOrderUpdate', $CommonState.EditSuccess);
	// 	} else {
	// 		const result = await GRAPHQL_CLIENT.mutation<
	// 			Pick<Mutation, 'orderUpdate'>,
	// 			MutationOrderUpdateArgs
	// 		>(ORDER_UPDATE_MUTATION, { id: page.params.id, input: input });
	// 		checkIfGraphqlResultHasError(result, 'orderUpdate', $CommonState.EditSuccess);
	// 	}
	// 	loading = false;
	// };

	// const handleCancelOrder = async () => {
	// 	ALERT_MODAL_STORE.openAlertModal({
	// 		content: 'Are you sure you want to cancel this order?',
	// 		onOk: async () => {
	// 			const hasErr = await OrderUtilsInstance.orderCancel(page.params.id!);
	// 			if (!hasErr) toast.success('Order cancelled successfully');
	// 		},
	// 	});
	// };
</script>

{#if $orderQuery.fetching}
	<DetailOrderSkeleton />
{:else if $orderQuery.error}
	<Alert variant="error" size="sm" bordered>{$orderQuery.error?.message}</Alert>
{:else if $orderQuery.data?.order}
	{@const { order } = $orderQuery.data}

	{#if ![OrderStatus.Draft, OrderStatus.Unconfirmed].includes(order.status)}
		<OrderNormalDetails {order} />
	{:else if order.status === OrderStatus.Draft}
		<OrderDraftDetails {order} onRefetchOrder={reexecuteQuery} />
	{/if}
	{#if order.fulfillments.length}
		<OrderFulfillment {order} onUpdateTrackingCode={reexecuteQuery} />
	{/if}
{/if}
