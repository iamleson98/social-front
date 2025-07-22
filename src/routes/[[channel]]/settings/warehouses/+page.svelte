<script lang="ts">
	import { WAREHOUSE_DELETE_MUTATION, WAREHOUSE_LIST_QUERY } from '$lib/api/admin/warehouse';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { Trash } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		WarehouseSortField,
		type Mutation,
		type MutationDeleteWarehouseArgs,
		type QueryWarehousesArgs,
		type Warehouse,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	let variables = $state<QueryWarehousesArgs>({
		first: 20,
		filter: { search: '' },
	});
	let forceReExecuteGraphqlQuery = $state(true);
	let loading = $state(false);

	const WarehouseColumns: TableColumnProps<Warehouse, WarehouseSortField>[] = [
		{
			title: 'Name',
			child: name,
			key: WarehouseSortField.Name,
		},
		{
			title: 'Shipping zones',
			child: shippingZones,
		},
		{
			title: 'Action',
			child: action,
		},
	];

	const handleClickDelete = async (id: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: `Are you sure to delete warehouse ${id}?`,
			onOk: async () => {
				loading = true; //

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'deleteWarehouse'>,
					MutationDeleteWarehouseArgs
				>(WAREHOUSE_DELETE_MUTATION, {
					id,
				});

				loading = false;

				if (
					checkIfGraphqlResultHasError(result, 'deleteWarehouse', 'Successfully deleted warehouse')
				)
					return;

				// force reexecute query
				forceReExecuteGraphqlQuery = true;
			},
		});
	};
</script>

{#snippet name({ item }: { item: Warehouse })}
	<a href={AppRoute.SETTINGS_CONFIGS_WAREHOUSE_DETAILS(item.id)} class="link">
		{item.name}
	</a>
{/snippet}

{#snippet action({ item }: { item: Warehouse })}
	<IconButton
		size="xs"
		color="red"
		variant="light"
		icon={Trash}
		onclick={() => handleClickDelete(item.id)}
		disabled={loading}
	/>
{/snippet}

{#snippet shippingZones({ item }: { item: Warehouse })}
	{@const items = item.shippingZones.edges.map((item) => item.node.name)}
	{#if items.length}
		<Badge text={items.join(', ')} />
	{:else}
		<span>-</span>
	{/if}
{/snippet}

<FilterManager
	bind:variables
	searchKey={'filter.search' as keyof QueryWarehousesArgs}
	bind:forceReExecuteGraphqlQuery
	disabled={loading}
/>

<GraphqlPaginableTable
	query={WAREHOUSE_LIST_QUERY}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	resultKey="warehouses"
	columns={WarehouseColumns}
	disabled={loading}
	class="bg-white rounded-lg border border-gray-200 p-3"
/>
