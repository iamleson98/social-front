<script lang="ts">
	import { Trash } from '$lib/components/icons';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { IconButton } from '$lib/components/ui/Button';
	import type { Channel, Warehouse } from '$lib/gql/graphql';

	type Props = {
		channel: Channel;
	};

	let { channel }: Props = $props();
</script>

<div>
	{#snippet sidebarItem(item: Warehouse)}
		<div class="flex items-center justify-between gap-1 rounded-md py-1">
			<span class="truncate">{item.name}</span>
			<IconButton icon={Trash} size="xs" rounded variant="light" color="red" />
		</div>
	{/snippet}

	<Alert variant="info" size="sm" bordered class="mb-3">
		Assign and sort warehouses that will be used in this channel (warehouses can be assigned in
		multiple channels).
	</Alert>

	<AccordionList
		header="Warehouses ({channel.warehouses.length})"
		child={sidebarItem}
		items={channel.warehouses}
		class="rounded-lg bg-white border border-gray-200 p-3"
		open={false}
	/>
</div>
