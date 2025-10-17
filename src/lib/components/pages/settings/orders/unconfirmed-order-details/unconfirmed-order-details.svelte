<script lang="ts">
	import { page } from '$app/state';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Ban, PencilMinus, SettingCog } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/Badge';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { type DropdownTriggerInterface, Popover } from '$lib/components/ui/Popover';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import type { Order } from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { GeneralMetadataEditor, type GeneralMetadataEditorRef } from '../../common';
	import OrderHistory from '../order-history.svelte';
	import OrderLinesSection from '../order-lines-section.svelte';
	import Sidebar from '../sidebar.svelte';
	import { OrderUtilsInstance } from '../utils.svelte';
	import dayjs from 'dayjs';
	import { toast } from 'svelte-sonner';

	type Props = {
		order: Order;
		onRefetchOrder?: () => void;
	};

	let { order, onRefetchOrder }: Props = $props();

	let loading = $state(false);
	let metaRef = $state<GeneralMetadataEditorRef>();

	const ShippingMethodChoices = $derived(
		order.shippingMethods.map<SelectOption>((method) => ({
			label: `${method.name} : ${method.price.currency} ${method.price.amount}`,
			value: method.id,
			disabled: !method.active,
		})),
	);

	const reexecuteQuery = () => {};

	const handleCancelOrder = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: 'Are you sure you want to cancel this order?',
			onOk: async () => {
				const hasErr = await OrderUtilsInstance.orderCancel(page.params.id!);
				if (!hasErr) toast.success('Order cancelled successfully');
			},
		});
	};
</script>

{#snippet shippingMethodModal()}
	<Popover placement="bottom-start">
		{#snippet trigger({ onclick }: DropdownTriggerInterface)}
			<Button size="xs" variant="light" color="blue" {onclick} disabled={loading}>
				{order.shippingMethodName || 'Shipping Method'}
			</Button>
		{/snippet}

		<div class="{SitenameCommonClassName} w-3xs shadow-md">
			<Select
				label="Please specify a shipping method"
				options={ShippingMethodChoices}
				disabled={OrderUtilsInstance.state.loading || loading}
				value={order.deliveryMethod?.id}
				size="sm"
				onchange={(opt) => {
					if (opt)
						OrderUtilsInstance.updateShippingMethod(order.id, {
							shippingMethod: (opt as SelectOption).value as string,
						});
				}}
			/>
		</div>
	</Popover>
{/snippet}

<div class="flex flex-row gap-2">
	<div class="space-y-2 w-7/10">
		<!-- MARK: header -->
		<SectionHeader>
			<div class="flex items-center gap-2">
				<div>Order #{order.number}</div>
				<Badge text={order.status} color="violet" variant="outline" size="sm" rounded />
				<div class="text-xs text-gray-500 font-medium">
					{dayjs(order.created).format(SitenameTimeFormat)}
				</div>
			</div>

			<DropDown placement="bottom-end">
				{#snippet trigger({ onclick }: DropdownTriggerInterface)}
					<IconButton icon={SettingCog} size="xs" color="gray" {onclick} />
				{/snippet}

				<MenuItem class="text-red-500" startIcon={Ban} onclick={handleCancelOrder}>
					Cancel order
				</MenuItem>
			</DropDown>
		</SectionHeader>

		<!-- MARK: order lines -->
		<OrderLinesSection onAddedOrderLines={onRefetchOrder} {order} />

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
							<!-- <DiscountPopup
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
							/> -->
							<div>Hello</div>
						</Popover>
					</div>
					<div>
						<!-- {#if OrderDiscountManual}
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
						{/if} -->
					</div>
				</div>
				<div class="flex justify-between">
					<div>Subtotal</div>
					<div>
						<PriceDisplay {...order.subtotal.gross} />
					</div>
				</div>
				<div class="flex justify-between">
					<div>{@render shippingMethodModal()}</div>
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

	<Sidebar {order} onRefetchOrder={reexecuteQuery} disabled={loading} />
</div>
