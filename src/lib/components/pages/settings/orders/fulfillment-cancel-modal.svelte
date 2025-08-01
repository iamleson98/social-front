<script lang="ts">
	import { ORDER_CANCEL_FULFILLMENT_MUTATION } from '$lib/api/admin/orders';
	import { WAREHOUSE_LIST_QUERY } from '$lib/api/admin/warehouse';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Alert } from '$lib/components/ui/Alert';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
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

	<GraphqlPaginableSelect
		optionValueKey="id"
		optionLabelKey="name"
		query={WAREHOUSE_LIST_QUERY}
		bind:value={warehouseId}
		placeholder="Select warehouse"
		label="Select warehouse"
		disabled={loading}
		variables={{
			first: 10,
			filter: {
				search: '',
			},
		}}
		resultKey="warehouses"
		variableSearchQueryPath="filter.search"
	/>
</Modal>
