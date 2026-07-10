<script lang="ts">
	import { goto } from '$app/navigation';
	import { CHANNEL_USABILITY_QUERY } from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { PencilMinus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Popover } from '$lib/components/ui/Popover';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import {
		DiscountValueTypeEnum,
		OrderDiscountType,
		type Order,
		type Query,
		type QueryProductsArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { GeneralMetadataEditor, type GeneralMetadataEditorRef } from '../../common';
	import ActionBar from '../../common/action-bar.svelte';
	import DiscountPopup from '../discount-popup.svelte';
	import HeaderSection from '../header-section.svelte';
	import OrderHistory from '../order-history.svelte';
	import OrderLinesSection from '../order-lines-section.svelte';
	import Sidebar from '../sidebar.svelte';
	import { Components } from '../snippets.svelte';
	import { OrderUtilsInstance } from '../utils.svelte';
	import { toast } from 'svelte-sonner';

	type Props = {
		loading?: boolean;
		order: Order;
		onRefetchOrder?: () => void;
	};

	let { loading, order, onRefetchOrder }: Props = $props();

	const OrderDiscountManual = $derived(
		order.discounts.find((discount) => discount.type === OrderDiscountType.Manual),
	);

	const ChannelUsabilityQuery = operationStore<Pick<Query, 'products'>, QueryProductsArgs>({
		query: CHANNEL_USABILITY_QUERY,
		variables: {
			channel: order.channel.slug,
		},
	});

	let metaRef = $state<GeneralMetadataEditorRef>();

	const getAlerts = (totalProductsCount: number) => {
		const canDetermineShippingMethods =
			order?.shippingAddress?.country.code && !!order?.lines?.length;
		const isChannelInactive = order && !order.channel.isActive;
		const noShippingMethodsInChannel =
			canDetermineShippingMethods && order?.shippingMethods.length === 0;

		const alerts = [];

		if (isChannelInactive) alerts.push('Channel is inactive');
		if (totalProductsCount === 0) alerts.push('No products in channel');
		if (noShippingMethodsInChannel) alerts.push(`${order.shippingAddress?.country.country} is not available as a shipping destination for this channel.`);

		return alerts;
	};

	/** we delete draft orders, not cancel them */
	const handleCancelOrder = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				const hasErr = await OrderUtilsInstance.deleteDraftOrder(order.id);
				if (!hasErr) {
					toast.success($CommonState.DeleteSuccess);
					await goto(AppRoute.SETTINGS_SHOP_DRAFT_ORDERS());
				}
			},
		});
	};

	const handleFinalizeOrder = async () => {
		const hasErr = await OrderUtilsInstance.finalizeDraftOrder(order.id);
		if (!hasErr) onRefetchOrder?.();
	};
</script>

<div class="flex flex-row gap-2">
	<div class="space-y-2 w-7/10">
		<HeaderSection {order} onCancelOrder={handleCancelOrder} />

		{#if $ChannelUsabilityQuery.fetching}
			<SelectSkeleton size="sm" label />
		{:else if $ChannelUsabilityQuery.error}
			<Alert variant="error" size="sm">{$ChannelUsabilityQuery.error.message}</Alert>
		{:else if $ChannelUsabilityQuery.data?.products}
			{@const alerts = getAlerts($ChannelUsabilityQuery.data.products.totalCount || 0)}
			{#if alerts.length}
				<Alert variant="warning" size="sm" dismissable>
					{#if alerts.length === 1}
						{alerts[0]}
					{:else}
						<ul>
							{#each alerts as alert}
								<li>{alert}</li>
							{/each}
						</ul>
					{/if}
				</Alert>
			{/if}
		{/if}

		<!-- MARK: order lines -->
		<OrderLinesSection allowAddOrderLines onAddedOrderLines={onRefetchOrder} {order} />

		<!-- MARK: summary -->
		{#if order.lines.length}
			<div class="{SitenameCommonClassName} text-sm text-gray-700">
				<div class="flex justify-between">
					<div>
						<Popover placement="bottom-start">
							{#snippet trigger({ onclick })}
								<Button
									size="xs"
									disabled={loading}
									variant="light"
									color="blue"
									{onclick}
									endIcon={PencilMinus}
								>
									Add discount
								</Button>
							{/snippet}
							<DiscountPopup
								{order}
								existingDiscount={OrderDiscountManual}
								onOk={async (discount) => {
									const ok = await OrderUtilsInstance.orderAddDiscount(order.id, discount);
									if (ok) onRefetchOrder?.();
								}}
								onRemove={async () => {
									if (OrderDiscountManual?.id) {
										const ok = await OrderUtilsInstance.orderDiscountDelete(OrderDiscountManual.id);
										if (ok) onRefetchOrder?.();
									}
								}}
							/>
						</Popover>
					</div>
					<div>
						{#if OrderDiscountManual}
							<span class="flex items-center gap-2">
								<span>
									{OrderDiscountManual.valueType === DiscountValueTypeEnum.Percentage
										? `${OrderDiscountManual.value}%`
										: ''}
								</span>
								<PriceDisplay {...OrderDiscountManual.total} />
							</span>
						{:else}
							<span>---</span>
						{/if}
					</div>
				</div>
				<div class="flex justify-between">
					<div>Subtotal</div>
					<div>
						<PriceDisplay {...order.subtotal.gross} />
					</div>
				</div>
				<div class="flex justify-between">
					<div>{@render Components.shippingMethodModal(order, onRefetchOrder)}</div>
					<div>
						<PriceDisplay {...order.shippingPrice.gross} />
					</div>
				</div>
				<div class="flex justify-between">
					<div>Taxes (VAT included)</div>
					<div>
						<PriceDisplay {...order.total.tax} />
					</div>
				</div>
				<div class="flex justify-between">
					<div>Total</div>
					<div>
						<PriceDisplay {...order.total.gross} />
					</div>
				</div>
			</div>
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

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_ORDERS()}
	onUpdateClick={handleFinalizeOrder}
	updateButtonText="Finalize"
	disabled={loading}
/>
