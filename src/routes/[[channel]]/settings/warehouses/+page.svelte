<script lang="ts">
	import { T } from '$i18n';
	import { WAREHOUSE_DELETE_MUTATION, WAREHOUSE_LIST_QUERY } from '$lib/api/admin/warehouse';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { Trash } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import {
		WarehouseSortField,
		type Mutation,
		type MutationDeleteWarehouseArgs,
		type QueryWarehousesArgs,
		type Warehouse,
	} from '$lib/gql/graphql';
	import { AlertModalStore } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	let variables = $state<QueryWarehousesArgs>({
		first: 20,
		filter: { search: '' },
	});
	let loading = $state(false);

	const WarehouseColumns: TableColumnProps<Warehouse, WarehouseSortField>[] = $derived([
		{
			title: $T('common.name'),
			child: name,
			key: WarehouseSortField.Name,
		},
		{
			title: $T('channel.shipZones'),
			child: shippingZones,
		},
		{
			title: $T('common.action'),
			child: action,
		},
	]);
	let tableRef = $state<GraphqlPaginableTableInterface>();

	const handleClickDelete = async (id: string) => {
		AlertModalStore.openAlertModal({
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true; //

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'deleteWarehouse'>,
					MutationDeleteWarehouseArgs
				>(WAREHOUSE_DELETE_MUTATION, {
					id,
				});

				loading = false;

				if (checkIfGraphqlResultHasError(result, 'deleteWarehouse', $CommonState.DeleteSuccess))
					return;

				// force reexecute query
				tableRef?.triggerFetchData();
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

<div class="mb-2">
	<FilterManager
		bind:variables
		searchKey={'filter.search' as keyof QueryWarehousesArgs}
		onRefetchData={() => tableRef?.triggerFetchData()}
		disabled={loading}
	/>
</div>

<GraphqlPaginableTable
	query={WAREHOUSE_LIST_QUERY}
	bind:variables
	resultKey="warehouses"
	columns={WarehouseColumns}
	disabled={loading}
	bind:this={tableRef}
/>
