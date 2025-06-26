<script lang="ts">
	import { ORDER_LINES_METADATA_QUERY } from '$lib/api/admin/orders';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Modal } from '$lib/components/ui/Modal';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { PermissionEnum, type Query, type QueryOrderArgs } from '$lib/gql/graphql';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth';
	import { checkUserHasPermissions } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import GeneralMetadataEditor from '../common/general-metadata-editor.svelte';

	type Props = {
		orderID: string;
		orderLineID?: string;
		onClose: () => void;
	};

	let { orderID, orderLineID, onClose }: Props = $props();

	let performUpdateMetadata = $state(false);

	const lineMetaQuery = operationStore<
		Pick<Query, 'order'>,
		QueryOrderArgs & { hasManageProductPerms: boolean }
	>({
		kind: 'query',
		query: ORDER_LINES_METADATA_QUERY,
		requestPolicy: 'cache-and-network',
		pause: true,
	});

	onMount(() =>
		READ_ONLY_USER_STORE.subscribe((user) => {
			const hasManageProductPerms = user
				? checkUserHasPermissions(user, PermissionEnum.ManageProducts)
				: false;
			lineMetaQuery.reexecute({
				variables: {
					id: orderID,
					hasManageProductPerms,
				},
			});
		}),
	);
</script>

<Modal
	size="sm"
	open={!!orderID && !!orderLineID}
	header="Order line metadata"
	onCancel={onClose}
	{onClose}
	onOk={() => (performUpdateMetadata = true)}
	closeOnOutsideClick
>
	{#if $lineMetaQuery.fetching}
		<SelectSkeleton label />
	{:else if $lineMetaQuery.error}
		<Alert variant="error" size="sm" bordered>{$lineMetaQuery.error.message}</Alert>
	{:else if $lineMetaQuery.data?.order}
		{@const orderLine = $lineMetaQuery.data.order.lines.find((line) => line.id === orderLineID)!}
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
					bind:performUpdateMetadata
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
					bind:performUpdateMetadata
				/>
			{/if}
		</div>
	{/if}
</Modal>
