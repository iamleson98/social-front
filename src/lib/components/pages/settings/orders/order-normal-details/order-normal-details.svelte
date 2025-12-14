<script lang="ts">
	import { goto } from '$app/navigation';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { PencilMinus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui/Button';
	import { Popover } from '$lib/components/ui/Popover';
	import {
		DiscountValueTypeEnum,
		FulfillmentStatus,
		OrderDiscountType,
		OrderStatus,
		type Order,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { GeneralMetadataEditor, type GeneralMetadataEditorRef } from '../../common';
	import DiscountPopup from '../discount-popup.svelte';
	import OrderDraftDetails from '../draft-order-details/order-draft-details.svelte';
	import HeaderSection from '../header-section.svelte';
	import OrderFulfillments from '../order-fulfillments.svelte';
	import OrderHistory from '../order-history.svelte';
	import OrderLinesSection from '../order-lines-section.svelte';
	import OrderPayment from '../order-payment.svelte';
	import OrderTransactionWrapper from '../order-transaction-wrapper.svelte';
	import Sidebar from '../sidebar.svelte';
	import { Components } from '../snippets.svelte';
	import UnfulfilledOrderLinesSection from '../unfulfilled-order-lines-section.svelte';
	import { orderShouldUseTransactions } from '../utils';
	import { OrderUtilsInstance } from '../utils.svelte';
	import toast from 'svelte-french-toast';

	type Props = {
		order: Order;
		loading?: boolean;
		onRefetchOrder: () => void;
	};

	let { order, loading, onRefetchOrder }: Props = $props();

	let metaRef = $state<GeneralMetadataEditorRef>();

	const handleCancelOrder = async () => {
		if (order.fulfillments.some(ful => ful.status === FulfillmentStatus.Fulfilled)) {
			toast.error('Order has some fulfilled fulfillment(s). Please cancel them first to cancel this order.');
			return;
		}

		ALERT_MODAL_STORE.openAlertModal({
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				const hasErr = await OrderUtilsInstance.orderCancel(order.id);
				if (!hasErr) {
					toast.success($CommonState.DeleteSuccess);
					await goto(AppRoute.SETTINGS_SHOP_DRAFT_ORDERS());
				}
			},
		});
	};
</script>

<div class="flex flex-row gap-2">
	<div class="space-y-2 w-7/10">
		<HeaderSection {order} onCancelOrder={handleCancelOrder} />

		<UnfulfilledOrderLinesSection {order} />

		<!-- MARK: fulfillments -->
		{#if order.fulfillments.length}
			<OrderFulfillments {order} onUpdateTrackingCode={onRefetchOrder} />
		{/if}

		<!-- MARK: order payment balance -->
		{#if orderShouldUseTransactions(order)}
			<OrderTransactionWrapper {order} />
		{:else}
			<OrderPayment {order} {onRefetchOrder} />
		{/if}

		<GeneralMetadataEditor
			metadata={order.metadata}
			privateMetadata={order.privateMetadata}
			objectId={order.id}
			disabled={loading}
			bind:this={metaRef}
		/>
		<OrderHistory id={order.id} />
	</div>

	<Sidebar {order} {onRefetchOrder} disabled={loading} />
</div>
