<script lang="ts">
	import { WAREHOUSE_LIST_QUERY } from '$lib/api/admin/warehouse';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import type { Channel, Warehouse } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { difference } from 'es-toolkit';

	type Props = {
		channels?: Channel[];
		warehouses?: Warehouse[];
		addWarehouses: string[];
		removeWarehouses?: string[];
		addChannels: string[];
		removeChannels?: string[];
		disabled?: boolean;
	};

	let {
		channels = [],
		warehouses = [],
		addWarehouses = $bindable(),
		removeWarehouses = $bindable(),
		addChannels = $bindable(),
		removeChannels = $bindable(),
		disabled,
	}: Props = $props();

	const existingChannelIds = channels.map((item) => item.id);
	const existingWarehouseIds = warehouses.map((item) => item.id);

	let channelIds = $state(existingChannelIds);
	let warehouseIds = $state(existingWarehouseIds);

	const handleSelectionChange = () => {
		addChannels = difference(channelIds, existingChannelIds);
		addWarehouses = difference(warehouseIds, existingWarehouseIds);

		removeChannels = difference(existingChannelIds, channelIds);
		removeWarehouses = difference(existingWarehouseIds, warehouseIds);
	};
</script>

<div class="space-y-2 w-4/10">
	<div class={SitenameCommonClassName}>
		<SectionHeader>Channels</SectionHeader>

		<Alert size="sm" bordered>
			Assign channels to this shipping zone so we know which orders will be supported
		</Alert>

		<ChannelSelect
			placeholder="Channels"
			label="Channels"
			required
			valueType="id"
			bind:value={channelIds}
			multiple
			onchange={handleSelectionChange}
			{disabled}
		/>
	</div>

	<div class={SitenameCommonClassName}>
		<SectionHeader>Warehouses</SectionHeader>

		<Alert size="sm" bordered>
			Select warehouse from which you will ship products for this shipping zone. This warehouse
			address will also be used to calculate taxes.
		</Alert>

		<GraphqlPaginableSelect
			optionValueKey="id"
			optionLabelKey="name"
			query={WAREHOUSE_LIST_QUERY}
			placeholder="Warehouses"
			label="Warehouses"
			required
			bind:value={warehouseIds}
			onchange={handleSelectionChange}
			multiple
			variables={{
				first: 10,
				filter: {
					search: '',
				},
			}}
			resultKey="warehouses"
			variableSearchQueryPath="filter.search"
		/>

		<data class="text-right text-xs">
			<div>
				Not found a warehouse? <a
					href={AppRoute.SETTINGS_CONFIGS_WAREHOUSE_NEW()}
					class="link font-medium">Create one</a
				>
			</div>
		</data>
	</div>
</div>
