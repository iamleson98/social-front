<script lang="ts">
	import { ORDER_FULFILLMENT_UPDATE_TRACKING_MUTATION } from '$lib/api/admin/orders';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { ExternalLink, Icon, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import type { TableCellProps, TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import { FulfillmentStatus } from '$lib/gql/graphql';
	import type {
		Fulfillment,
		FulfillmentLine,
		Mutation,
		MutationOrderFulfillmentUpdateTrackingArgs,
		Order,
	} from '$lib/gql/graphql';
	import { ShopStoreManager } from '$lib/stores/shop';
	import { AppRoute } from '$lib/utils';
	import {
		checkIfGraphqlResultHasError,
		fulfillmentStatusBadgeClass,
		SitenameCommonClassName,
		stringSlicer,
	} from '$lib/utils/utils';
	import GeneralMetadataEditor from '../common/general-metadata-editor.svelte';
	import FulfillmentCancelModal from './fulfillment-cancel-modal.svelte';
	import OrderLineMetadataModal from './order-line-metadata-modal.svelte';
	import { orderHasTransactions } from './utils';
	import { OrderUtilsInstance } from './utils.svelte';
	import { toast } from 'svelte-sonner';

	type Props = {
		order: Order;
		onUpdateTrackingCode?: () => void;
	};

	let { order, onUpdateTrackingCode }: Props = $props();

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<FulfillmentLine, any>[] = [
		{
			title: 'Image',
			child: image,
		},
		{
			title: 'Product',
			child: product,
		},
		{
			title: 'SKU',
			child: sku,
		},
		{
			title: 'Variant',
			child: variant,
		},
		{
			title: 'Quantity',
			child: quantity,
		},
		{
			title: 'Price',
			child: price,
		},
		{
			title: 'Total',
			child: total,
		},
		{
			title: 'Is gift',
			child: isGift,
		},
		{
			title: 'Metadata',
			child: metadata,
		},
		{
			title: 'Actions',
			child: actions,
		},
	];

	let openTrackingModal = $state(false);
	let loading = $state(false);
	let trackingCode = $state('');
	let fulfillmentToCancelWarehouseID = $state<string>();
	let selectedFulfillment = $state<Fulfillment>();
	let metadataModelRef = $state<ReturnType<typeof OrderLineMetadataModal>>();

	let fulfillmentToApprove = $state<Fulfillment>();
	let notifyCustomerOnApprovement = $state(false);

	const editTrackingCode = async () => {
		if (!selectedFulfillment) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderFulfillmentUpdateTracking'>,
			MutationOrderFulfillmentUpdateTrackingArgs
		>(ORDER_FULFILLMENT_UPDATE_TRACKING_MUTATION, {
			id: selectedFulfillment.id,
			input: {
				trackingNumber: trackingCode,
				notifyCustomer: false,
			},
		});

		loading = false;

		if (
			!checkIfGraphqlResultHasError(
				result,
				'orderFulfillmentUpdateTracking',
				'Tracking code updated successfully',
			)
		) {
			openTrackingModal = false;
			trackingCode = '';
			onUpdateTrackingCode?.();
		}
	};

	const handleApproveFulfillment = async () => {
		const success = await OrderUtilsInstance.approveFulfillment(
			fulfillmentToApprove?.id!,
			notifyCustomerOnApprovement,
		);
		if (success) toast.success('Fulfillment approved successfully');
	};
</script>

{#snippet image({ item }: TableCellProps<FulfillmentLine>)}
	<Thumbnail
		src={item.orderLine?.thumbnail?.url}
		alt={item.orderLine?.thumbnail?.alt || item.orderLine?.productName || '-'}
		size="sm"
	/>
{/snippet}

{#snippet product({ item }: TableCellProps<FulfillmentLine>)}
	<span title={item.orderLine?.productName}>{stringSlicer(item.orderLine?.productName, 35)}</span>
{/snippet}

{#snippet sku({ item }: TableCellProps<FulfillmentLine>)}
	<span>{item.orderLine?.productSku || '-'}</span>
{/snippet}

{#snippet variant({ item }: TableCellProps<FulfillmentLine>)}
	<span>{item.orderLine?.variant?.name || '-'}</span>
{/snippet}

{#snippet actions({ item }: TableCellProps<FulfillmentLine>)}
	<a
		href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.orderLine!.variant!.product.slug)}
		class="flex justify-center text-blue-600"
		target="_blank"
	>
		<Icon icon={ExternalLink} />
	</a>
{/snippet}

{#snippet quantity({ item }: TableCellProps<FulfillmentLine>)}
	<div class="text-center">{item.quantity}</div>
{/snippet}

{#snippet price({ item }: TableCellProps<FulfillmentLine>)}
	<PriceDisplay
		amount={item.orderLine?.unitPrice.gross.amount || 0}
		currency={item.orderLine?.unitPrice.gross.currency || ''}
	/>
{/snippet}

{#snippet total({ item }: TableCellProps<FulfillmentLine>)}
	<PriceDisplay
		amount={item.orderLine?.totalPrice.gross.amount || 0}
		currency={item.orderLine?.totalPrice.gross.currency || ''}
	/>
{/snippet}

{#snippet isGift({ item }: TableCellProps<FulfillmentLine>)}
	<div class="text-center">
		<Badge
			size="xs"
			color={item.orderLine?.isGift ? 'green' : 'red'}
			text={item.orderLine?.isGift ? 'yes' : 'no'}
		/>
	</div>
{/snippet}

{#snippet metadata({ item }: TableCellProps<FulfillmentLine>)}
	<Button
		size="xs"
		color="gray"
		variant="outline"
		onclick={() => item.orderLine && metadataModelRef?.performFetchingMetadata(item.orderLine.id)}
		>View Metadata</Button
	>
{/snippet}

<div class={SitenameCommonClassName}>
	{#each order.fulfillments as fulfillment, idx (idx)}
		<div
			class="border-gray-200 space-y-2 pb-2"
			class:border-b={idx !== order.fulfillments.length - 1}
		>
			<SectionHeader>
				<div class="flex items-center gap-2">
					<span>#{order.number}-{fulfillment.fulfillmentOrder}</span>
					<Badge {...fulfillmentStatusBadgeClass(fulfillment.status)} rounded size="sm" />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs text-gray-500 font-medium">
						Fulfilled from {fulfillment.warehouse?.name}
					</span>
					{#if fulfillment.status === FulfillmentStatus.Fulfilled || fulfillment.status === FulfillmentStatus.WaitingForApproval}
						<IconButton
							icon={Trash}
							size="xs"
							variant="light"
							color="red"
							onclick={() => (fulfillmentToCancelWarehouseID = fulfillment.id)}
						/>
					{/if}
					{#if [FulfillmentStatus.Fulfilled, FulfillmentStatus.WaitingForApproval, FulfillmentStatus.Returned].includes(fulfillment.status)}
						{#if fulfillment.status === FulfillmentStatus.WaitingForApproval}
							{@const cannotFulfill = !order.isPaid && !$ShopStoreManager?.fulfillmentAllowUnpaid}
							<Button
								size="xs"
								disabled={cannotFulfill}
								onclick={() => (fulfillmentToApprove = fulfillment)}
							>
								Approve
							</Button>
							{#if cannotFulfill}
								<div class="text-xs text-gray-500">Cannot fulfill unpaid order</div>
							{/if}
						{:else if fulfillment.status === FulfillmentStatus.Refunded && !orderHasTransactions(order)}
							<Button size="xs" color="gray">Refund</Button>
						{:else if !!fulfillment.trackingNumber}
							<Button
								size="xs"
								color="gray"
								onclick={() => {
									trackingCode = fulfillment.trackingNumber;
									openTrackingModal = true;
									selectedFulfillment = fulfillment;
								}}>Edit tracking</Button
							>
						{:else}
							<Button
								size="xs"
								color="gray"
								onclick={() => {
									openTrackingModal = true;
									selectedFulfillment = fulfillment;
								}}>Add tracking</Button
							>
						{/if}
					{/if}
				</div>
			</SectionHeader>

			<div class="overflow-x-auto">
				<Table columns={PRODUCT_MODAL_COLUMNS} items={fulfillment.lines || []} />
			</div>
			{#if fulfillment.trackingNumber && fulfillment.warehouse}
				<div class="text-xs text-gray-500">
					<div class="mb-1">Fulfilled from: {fulfillment.warehouse.name}</div>
					<div>Tracking code: {fulfillment.trackingNumber}</div>
				</div>
			{/if}

			<GeneralMetadataEditor
				metadata={fulfillment.metadata}
				privateMetadata={fulfillment.privateMetadata}
				objectId={fulfillment.id}
			/>
		</div>
	{/each}
</div>

<OrderLineMetadataModal orderId={order.id} bind:this={metadataModelRef} />

<FulfillmentCancelModal
	fulfillmentID={fulfillmentToCancelWarehouseID}
	onClose={() => (fulfillmentToCancelWarehouseID = undefined)}
/>

<Modal
	header="Fulfillment approve"
	closeOnEscape
	closeOnOutsideClick
	open={!!fulfillmentToApprove}
	onOk={handleApproveFulfillment}
	disableElements={OrderUtilsInstance.state.loading}
>
	<div class="space-y-2">
		<Alert size="sm" variant="info">Are you sure you want to approve this fulfillment?</Alert>
		<Checkbox
			disabled={OrderUtilsInstance.state.loading}
			label="Notify customer"
			size="sm"
			bind:checked={notifyCustomerOnApprovement}
		/>
	</div>
</Modal>

<Modal
	open={openTrackingModal}
	size="sm"
	onClose={() => (openTrackingModal = false)}
	onCancel={() => (openTrackingModal = false)}
	onOk={editTrackingCode}
	closeOnOutsideClick
	closeOnEscape
	disableElements={loading}
	header="Add/Update tracking code"
>
	<Input
		disabled={loading}
		placeholder="Tracking code"
		bind:value={trackingCode}
		label="Tracking code"
	/>
</Modal>
