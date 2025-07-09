<script lang="ts">
	import { SHIPPING_ZONES_QUERY } from '$lib/api/admin/channels';
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
	];
</script>

{#snippet name({ item }: { item: ShippingZone })}
	<a href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(item.id)} class="link link-hover">
		{item.name}
	</a>
{/snippet}

<GraphqlPaginableTable
	query={SHIPPING_ZONES_QUERY}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	resultKey="shippingZones"
	columns={ShippingZoneColumns}
/>
