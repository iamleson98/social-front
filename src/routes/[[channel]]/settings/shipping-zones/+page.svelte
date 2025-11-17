<script lang="ts">
	import { tranFunc } from '$i18n';
	import { SHIPPING_ZONES_QUERY } from '$lib/api/admin/shipping';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		reFetchTableData,
		TableNameKeys,
	} from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import { type QueryShippingZonesArgs, type ShippingZone } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	let variables = $state<QueryShippingZonesArgs>({
		first: 20,
		filter: {
			search: '',
		},
	});

	const ShippingZoneColumns: TableColumnProps<ShippingZone>[] = $derived([
		{
			title: $tranFunc('common.name'),
			child: name,
		},
		{
			title: $tranFunc('common.countries'),
			child: { render: ({ item }) => item.countries.length },
		},
	]);
</script>

{#snippet name({ item }: { item: ShippingZone })}
	<a href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(item.id)} class="link">
		{item.name}
	</a>
{/snippet}

<div class="mb-2">
	<FilterManager
		bind:variables
		onRefetchData={() => reFetchTableData(TableNameKeys.ShippingZonesTable)}
		searchKey="filter.search"
	/>
</div>

<GraphqlPaginableTable
	query={SHIPPING_ZONES_QUERY}
	bind:variables
	tableName={TableNameKeys.ShippingZonesTable}
	resultKey="shippingZones"
	columns={ShippingZoneColumns}
/>
