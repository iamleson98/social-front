<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import { FulfillmentStatus } from '$lib/gql/graphql';
	import type {
		Fulfillment,
		FulfillmentLine,
		Mutation,
		MutationOrderFulfillmentUpdateTrackingArgs,
		Order,
	} from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import {
		checkIfGraphqlResultHasError,
		fulfillmentStatusBadgeClass,
		orderStatusBadgeClass,
		stringSlicer,
	} from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import OrderLineMetadataModal from './order-line-metadata-modal.svelte';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import GeneralMetadataEditor from '../common/general-metadata-editor.svelte';
	import { IconButton } from '$lib/components/ui/Button';
	import { ExternalLink, Icon, Trash } from '$lib/components/icons';
	import FulfillmentCancelModal from './fulfillment-cancel-modal.svelte';
	import OrderLines from './order-lines.svelte';
	import { AppRoute } from '$lib/utils';
	import { differenceBy } from 'es-toolkit';
	import { Modal } from '$lib/components/ui/Modal';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { ORDER_FULFILLMENT_UPDATE_TRACKING_MUTATION } from '$lib/api/admin/orders';

	type Props = {
		order: Order;
		onUpdateTrackingCode: () => void;
	};

	let { order, onUpdateTrackingCode }: Props = $props();

	let openTrackingModal = $state(false);
	let loading = $state(false);
	let trackingCode = $state('');

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

	let orderLineIDForMetadataView = $state<string>();
	let fulfillmentToCancelWarehouseID = $state<string>();
	let selectedFulfillment = $state<Fulfillment>();

	let unfulfilledOrderLines = $derived.by(() => {
		const fulfilledOrderLines = order.fulfillments
			.filter((item) => item.status === FulfillmentStatus.Fulfilled)
			.flatMap((item) => item.lines || [])
			.map((item) => item.orderLine)
			.filter(Boolean);

		return differenceBy(order.lines, fulfilledOrderLines, (item) => item?.id);
	});

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
			onUpdateTrackingCode();
		}
	};
</script>

{#snippet image({ item }: { item: FulfillmentLine })}
	<div class="avatar">
		<div class="w-9 rounded border border-gray-200">
			<img src={item.orderLine?.thumbnail?.url} alt={item.orderLine?.thumbnail?.alt} />
		</div>
	</div>
{/snippet}

{#snippet product({ item }: { item: FulfillmentLine })}
	<span title={item.orderLine?.productName}>{stringSlicer(item.orderLine?.productName, 60)}</span>
{/snippet}

{#snippet sku({ item }: { item: FulfillmentLine })}
	{item.orderLine?.productSku}
{/snippet}

{#snippet variant({ item }: { item: FulfillmentLine })}
	{item.orderLine?.variant?.name}
{/snippet}

{#snippet actions({ item }: { item: FulfillmentLine })}
	<a
		href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.orderLine!.variant!.product.slug)}
		class="flex justify-center text-blue-600"
		target="_blank"
	>
		<Icon icon={ExternalLink} />
	</a>
{/snippet}

{#snippet quantity({ item }: { item: FulfillmentLine })}
	<div class="text-center">{item.quantity}</div>
{/snippet}

{#snippet price({ item }: { item: FulfillmentLine })}
	<PriceDisplay
		amount={item.orderLine?.unitPrice.gross.amount || 0}
		currency={item.orderLine?.unitPrice.gross.currency || ''}
	/>
{/snippet}

{#snippet total({ item }: { item: FulfillmentLine })}
	<PriceDisplay
		amount={item.orderLine?.totalPrice.gross.amount || 0}
		currency={item.orderLine?.totalPrice.gross.currency || ''}
	/>
{/snippet}

{#snippet isGift({ item }: { item: FulfillmentLine })}
	<Checkbox checked={item.orderLine?.isGift} size="sm" disabled />
{/snippet}

{#snippet metadata({ item }: { item: FulfillmentLine })}
	<Button
		size="sm"
		color="gray"
		variant="outline"
		onclick={() => (orderLineIDForMetadataView = item.orderLine!.id)}>View Metadata</Button
	>
{/snippet}

<div class="bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-3">
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
		<OrderLines orderLines={unfulfilledOrderLines} orderID={order.id} />
	{/if}

	{#each order.fulfillments as fulfillment, idx (idx)}
		<div class="border-b border-gray-200 flex flex-col gap-2 pb-2">
			<SectionHeader>
				<Badge {...fulfillmentStatusBadgeClass(fulfillment.status)} rounded />
				<div class="flex items-center gap-2">
					<span class="text-xs text-gray-500 font-medium">
						Fulfilled from {fulfillment.warehouse?.name}
					</span>
					{#if fulfillment.status === FulfillmentStatus.Fulfilled}
						<IconButton
							icon={Trash}
							size="xs"
							variant="light"
							color="red"
							onclick={() => (fulfillmentToCancelWarehouseID = fulfillment.id)}
						/>
						<Button
							size="xs"
							onclick={() => {
								selectedFulfillment = fulfillment;
								trackingCode = fulfillment.trackingNumber as string;
								openTrackingModal = true;
							}}>{fulfillment.trackingNumber ? 'Edit tracking' : 'Add tracking'}</Button
						>
					{/if}
				</div>
			</SectionHeader>

			<div class="overflow-x-auto">
				<Table columns={PRODUCT_MODAL_COLUMNS} items={fulfillment.lines || []} />
			</div>
			{#if fulfillment.trackingNumber}
				<div class="text-xs text-gray-500">
					<div class="mb-1">Fulfilled from: {fulfillment.warehouse?.name}</div>
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

<OrderLineMetadataModal
	orderID={order.id}
	orderLineID={orderLineIDForMetadataView}
	onClose={() => (orderLineIDForMetadataView = undefined)}
/>

<FulfillmentCancelModal
	fulfillmentID={fulfillmentToCancelWarehouseID}
	onClose={() => (fulfillmentToCancelWarehouseID = undefined)}
/>

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
	<div>
		<Input
			disabled={loading}
			placeholder="Tracking code"
			bind:value={trackingCode}
			label="Tracking code"
		/>
	</div>
</Modal>
