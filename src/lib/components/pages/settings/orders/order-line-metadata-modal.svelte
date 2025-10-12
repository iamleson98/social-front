<script lang="ts">
	import { ORDER_LINES_METADATA_QUERY } from '$lib/api/admin/orders';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Modal } from '$lib/components/ui/Modal';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { type Query, type QueryOrderArgs } from '$lib/gql/graphql';
	import type { GeneralMetadataEditorRef } from '../common';
	import GeneralMetadataEditor from '../common/general-metadata-editor.svelte';
	import { toast } from 'svelte-sonner';

	type Props = {
		orderId: string;
	};

	let { orderId }: Props = $props();

	let orderLineMetaRef = $state<GeneralMetadataEditorRef>();
	let orderLineVariantMetaRef = $state<GeneralMetadataEditorRef>();
	let open = $state(false);
	let orderLineId = $state<string>();

	const OrderLineMetadataQuery = operationStore<
		Pick<Query, 'order'>,
		QueryOrderArgs & { hasManageProductPerms: boolean }
	>({
		query: ORDER_LINES_METADATA_QUERY,
		requestPolicy: 'cache-and-network',
		pause: true,
	});

	export const performFetchingMetadata = async (newOrderLineId: string) => {
		open = true;
		orderLineId = newOrderLineId;

		OrderLineMetadataQuery.reexecute({
			variables: {
				id: orderId,
				hasManageProductPerms: true,
			},
		});
	};

	const innerClose = () => {
		open = false;
	};

	const handleUpdateMetadatas = async () => {
		const jobs = [orderLineMetaRef?.handleUpdate(), orderLineVariantMetaRef?.handleUpdate()];
		const results = await Promise.all(jobs);
		if (results.every((item) => item)) toast.success('Metadata updated successfully');
	};
</script>

<Modal
	size="sm"
	{open}
	header="Order line metadata"
	onCancel={innerClose}
	onClose={innerClose}
	onOk={handleUpdateMetadatas}
	closeOnOutsideClick
>
	{#if $OrderLineMetadataQuery.fetching}
		<SelectSkeleton label />
	{:else if $OrderLineMetadataQuery.error}
		<Alert variant="error" size="sm" bordered>{$OrderLineMetadataQuery.error.message}</Alert>
	{:else if $OrderLineMetadataQuery.data?.order}
		{@const orderLine = $OrderLineMetadataQuery.data.order.lines.find(
			(line) => line.id === orderLineId,
		)!}
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-2">
				<div class="avatar">
					<div class="w-24 rounded-lg border border-gray-200">
						<img src={orderLine.thumbnail?.url} alt={orderLine.thumbnail?.alt} />
					</div>
				</div>
				<div>
					<SectionHeader>{orderLine.productName}</SectionHeader>
					<div class="text-sm text-gray-600 font-medium">
						Variant: {orderLine.variant?.id}
					</div>
					<div class="text-sm text-gray-600 font-medium">
						Quantity: {orderLine.quantity}
					</div>
				</div>
			</div>
			{#if orderLine.variant}
				<div>
					<div class="text-sm font-medium text-gray-800">Order line metadata</div>
					<Alert size="sm" bordered>Represents the metadata of the given ordered item</Alert>
				</div>
				<GeneralMetadataEditor
					metadata={orderLine.metadata}
					privateMetadata={orderLine.privateMetadata || []}
					objectId={orderLine.id}
					bind:this={orderLineMetaRef}
				/>

				<div class="border-t border-gray-200"></div>

				<div>
					<div class="text-sm font-medium text-gray-800">Product variant metadata</div>
					<Alert size="sm" bordered>
						This is a metadata of the variant that is being used in this ordered item
					</Alert>
				</div>

				<GeneralMetadataEditor
					metadata={orderLine.variant.metadata}
					privateMetadata={orderLine.variant.privateMetadata}
					objectId={orderLine.variant.id}
					bind:this={orderLineVariantMetaRef}
				/>
			{/if}
		</div>
	{/if}
</Modal>
