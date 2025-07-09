<script lang="ts">
	import { page } from '$app/state';
	import { WAREHOUSE_SHIPPING_ZONES_QUERY } from '$lib/api/admin/shipping';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { RadioButton } from '$lib/components/ui/Input';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		WarehouseClickAndCollectOptionEnum,
		type Query,
		type ShippingZone,
	} from '$lib/gql/graphql';

	type Props = {
		isPrivate: boolean;
		clickAndCollectOption: WarehouseClickAndCollectOptionEnum;
	};

	let { isPrivate = $bindable(), clickAndCollectOption = $bindable() }: Props = $props();

	let warehouseShippingZonesVariables = $state({
		first: 10,
		id: page.params.id,
	});

	const ShippingColumns: TableColumnProps<ShippingZone>[] = [
		{
			title: 'name',
			child: name,
		},
	];
</script>

{#snippet name({ item }: { item: ShippingZone })}
	<span>{item.name}</span>
{/snippet}

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
	<SectionHeader>Shipping zones</SectionHeader>

	<GraphqlPaginableTable
		query={WAREHOUSE_SHIPPING_ZONES_QUERY}
		resultKey={'warehouse.shippingZones' as keyof Query}
		columns={ShippingColumns}
		bind:variables={warehouseShippingZonesVariables}
	/>
</div>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
	<SectionHeader>Stock settings</SectionHeader>

	<RadioButton
		label="Private stock"
		size="sm"
		subText="If enabled stock in this warehouse won't be shown"
		value={true}
		bind:group={isPrivate}
	/>
	<RadioButton
		label="Public stock"
		size="sm"
		subText="If enabled stock in this warehouse will be shown"
		value={false}
		bind:group={isPrivate}
	/>
</div>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
	<SectionHeader>
		<span>Pickup</span>

		<Badge size="xs" rounded variant="outline" text="preview" />
	</SectionHeader>

	<RadioButton
		label="Disabled"
		size="sm"
		subText="If selected customer won't be able to choose this warehouse as pickup point"
		value={WarehouseClickAndCollectOptionEnum.Local}
		bind:group={clickAndCollectOption}
	/>
	<RadioButton
		label="All warehouses"
		size="sm"
		subText="If selected customer will be able to choose this warehouse as pickup point. Ordered products can be shipped here from a different warehouse"
		value={WarehouseClickAndCollectOptionEnum.All}
		bind:group={clickAndCollectOption}
	/>
</div>
