<script lang="ts">
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import WarehouseSelect from '$lib/components/common/warehouse-select.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Channel, Warehouse } from '$lib/gql/graphql';

	type Props = {
		channels?: Channel[];
    warehouses?: Warehouse[];
	};

	let { channels = [], warehouses = [] }: Props = $props();

	let channelIds = $state(channels.map((item) => item.id));
  let warehouseIds = $state(warehouses.map(item => item.id));
</script>

<div class="space-y-2 w-4/10">
	<div class="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
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
		/>
	</div>

	<div class="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
		<SectionHeader>Warehouses</SectionHeader>

		<Alert size="sm" bordered>
			Select warehouse from which you will ship products for this shipping zone. This warehouse
			address will also be used to calculate taxes.
		</Alert>

    <WarehouseSelect
      bind:value={warehouseIds}
      placeholder="Warehouses"
      label="Warehouses"
      required
      multiple
    />
	</div>
</div>
