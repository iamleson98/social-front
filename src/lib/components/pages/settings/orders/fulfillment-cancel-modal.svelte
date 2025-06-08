<script lang="ts">
	import { ORDER_CANCEL_FULFILLMENT_MUTATION } from '$lib/api/admin/orders';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import WarehouseSelect from '$lib/components/common/warehouse-select.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Modal } from '$lib/components/ui/Modal';
	import type { Mutation, MutationOrderFulfillmentCancelArgs } from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { toast } from 'svelte-sonner';

	type Props = {
		fulfillmentID?: string;
		onClose: () => void;
	};

	let { fulfillmentID, onClose }: Props = $props();

	let warehouseId = $state<string>();
	let loading = $state(false);

	const handleChangeWarehouse = async () => {
		if (!warehouseId) {
			toast.warning('Please select a warehouse');
			return;
		}

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderFulfillmentCancel'>,
			MutationOrderFulfillmentCancelArgs
		>(ORDER_CANCEL_FULFILLMENT_MUTATION, {
			id: fulfillmentID!,
			input: {
				warehouseId: warehouseId,
			},
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'orderFulfillmentCancel',
				'Fulfillment canceled successfully',
			)
		) {
			return;
		}
	};
</script>

<Modal
	size="sm"
	header="Cancel fulfillment"
	open={!!fulfillmentID}
	{onClose}
	onCancel={onClose}
	onOk={handleChangeWarehouse}
	disableElements={loading}
>
	<Alert variant="warning" size="sm" bordered class="mb-2">
		Are you sure you want to cancel fulfillment? <br /> Canceling a fulfillment will restock products
		at a selected warehouse.
	</Alert>

	<WarehouseSelect
		bind:value={warehouseId}
		label="Select warehouse"
		placeholder="Select warehouse"
		disabled={loading}
	/>
</Modal>
