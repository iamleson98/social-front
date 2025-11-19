<script lang="ts">
	import { tranFunc } from '$i18n';
	import { SHIPPING_ZONES_QUERY } from '$lib/api/admin/shipping';
	import { FilterManager } from '$lib/components/common/filter-box';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import { type QueryShippingZonesArgs, type ShippingZone } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	let variables = $state<QueryShippingZonesArgs>({
		first: 20,
		filter: {
			search: '',
		},
	});
	let tableRef = $state<GraphqlPaginableTableInterface>();

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
		onRefetchData={() => tableRef?.triggerFetchData()}
		searchKey="filter.search"
	/>
</div>

<GraphqlPaginableTable
	query={SHIPPING_ZONES_QUERY}
	bind:variables
	bind:this={tableRef}
	resultKey="shippingZones"
	columns={ShippingZoneColumns}
/>
