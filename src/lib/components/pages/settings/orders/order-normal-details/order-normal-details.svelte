<script lang="ts">
	import { goto } from '$app/navigation';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Ban, PencilMinus, SettingCog } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/Badge';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { Popover, type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import {
		DiscountValueTypeEnum,
		OrderDiscountType,
		OrderStatus,
		type Order,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { GeneralMetadataEditor, type GeneralMetadataEditorRef } from '../../common';
	import DiscountPopup from '../discount-popup.svelte';
	import OrderHistory from '../order-history.svelte';
	import OrderLinesSection from '../order-lines-section.svelte';
	import Sidebar from '../sidebar.svelte';
	import { Components } from '../snippets.svelte';
	import UnfulfilledOrderLinesSection from '../unfulfilled-order-lines-section.svelte';
	import { OrderUtilsInstance } from '../utils.svelte';
	import dayjs from 'dayjs';
	import { toast } from 'svelte-sonner';

	type Props = {
		order: Order;
		loading?: boolean;
		onRefetchOrder?: () => void;
	};

	let { order, loading, onRefetchOrder }: Props = $props();

	let metaRef = $state<GeneralMetadataEditorRef>();

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
</script>

<div class="flex flex-row gap-2">
	<div class="space-y-2 w-7/10">
		<SectionHeader class={SitenameCommonClassName}>
			<div class="flex items-center gap-2">
				<div>Order #{order.number}</div>
				<Badge text={order.status} color="gray" variant="outline" rounded />
				<div class="text-xs text-gray-500 font-medium">
					{dayjs(order.created).format(SitenameTimeFormat)}
				</div>
			</div>

			<DropDown placement="bottom-end">
				{#snippet trigger({ onclick }: DropdownTriggerInterface)}
					<IconButton icon={SettingCog} size="sm" color="gray" variant="light" {onclick} />
				{/snippet}

				{#if order.status !== OrderStatus.Canceled}
					<MenuItem class="text-red-500" startIcon={Ban} onclick={handleCancelOrder}>
						Cancel order
					</MenuItem>
				{/if}
			</DropDown>
		</SectionHeader>

		{#if order.status !== OrderStatus.Unconfirmed}
			<UnfulfilledOrderLinesSection {order} />
		{:else}
			{@const OrderDiscountManual = order.discounts.find(
				(discount) => discount.type === OrderDiscountType.Manual,
			)}
			<!-- This section shares some similarities with draft order detail -->

			<!-- MARK: order lines -->
			<OrderLinesSection allowAddOrderLines onAddedOrderLines={onRefetchOrder} {order} />

			<!-- MARK: summary -->
			{#if order.lines.length}
				<div class="{SitenameCommonClassName} text-sm text-gray-700">
					<div class="flex justify-between">
						<div>
							<Popover placement="bottom-start">
								{#snippet trigger({ onclick }: DropdownTriggerInterface)}
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
											const ok = await OrderUtilsInstance.orderDiscountDelete(
												OrderDiscountManual.id,
											);
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

			<!-- MARK: fulfillment -->

			<GeneralMetadataEditor
				metadata={order.metadata}
				privateMetadata={order.privateMetadata}
				objectId={order.id}
				disabled={loading}
				bind:this={metaRef}
			/>
			<OrderHistory id={order.id} />
		{/if}
	</div>

	<Sidebar {order} {onRefetchOrder} disabled={loading} />
</div>
