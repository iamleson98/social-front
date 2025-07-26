<script lang="ts">
	import { SHIPPING_ZONES_QUERY } from '$lib/api/admin/shipping';
	import FilterManager from '$lib/components/common/filter-box/filter-manager.svelte';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { type QueryShippingZonesArgs, type ShippingZone } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	let variables = $state<QueryShippingZonesArgs>({
		first: 20,
		filter: {
			search: '',
		},
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const ShippingZoneColumns: TableColumnProps<ShippingZone>[] = [
		{
			title: 'Name',
			child: name,
		},
		{
			title: 'Countries',
			child: countries,
		},
	];
</script>

{#snippet name({ item }: { item: ShippingZone })}
	<a href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(item.id)} class="link">
		{item.name}
	</a>
{/snippet}

{#snippet countries({ item }: { item: ShippingZone })}
	<span>{item.countries.length}</span>
{/snippet}

<FilterManager bind:variables bind:forceReExecuteGraphqlQuery searchKey="filter.search" />

<GraphqlPaginableTable
	query={SHIPPING_ZONES_QUERY}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	resultKey="shippingZones"
	columns={ShippingZoneColumns}
/>
