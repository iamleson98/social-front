<script lang="ts">
	import { tranFunc } from '$i18n';
	import { CHANNEL_WAREHOUSES_QUERY } from '$lib/api/admin/channels';
	import { WAREHOUSE_LIST_QUERY } from '$lib/api/admin/warehouse';
	import { operationStore } from '$lib/api/operation';
	import { Plus, Trash } from '$lib/components/icons';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Query, QueryChannelArgs, Warehouse } from '$lib/gql/graphql';
	import { onMount } from 'svelte';

	type Props = {
		/**if not provided, meaning new channel creation page*/
		channelSlug?: string;
		addWarehouses: string[];
		/**if not provided, meaning new channel creation page*/
		removeWarehouses?: string[];
		disabled: boolean;
	};

	let {
		channelSlug,
		addWarehouses = $bindable([]),
		removeWarehouses = $bindable(),
		disabled,
	}: Props = $props();

	const BATCH_FETCH = 100;

	let showAddWarehouses = $state(false);
	let warehousesOfChannel = $state.raw<Warehouse[]>([]);

	const warehousesOfChannelQuery = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		query: CHANNEL_WAREHOUSES_QUERY,
		variables: {
			slug: channelSlug,
		},
		requestPolicy: 'network-only',
		pause: true, // don't call this when in channel creation page
	});

	const handleDeleteWarehouse = (id: string) => {
		warehousesOfChannel = warehousesOfChannel.filter((warehouse) => warehouse.id !== id);
		if (!removeWarehouses?.includes(id)) {
			removeWarehouses = removeWarehouses?.concat(id);
		}
	};

	onMount(() => {
		if (channelSlug) {
			warehousesOfChannelQuery.resume();

			return warehousesOfChannelQuery.subscribe((result) => {
				if (result.data?.channel?.warehouses) {
					warehousesOfChannel = result.data?.channel?.warehouses;
				}
			});
		}
	});

	const handleAddWarehouses = (options?: SelectOption[] | SelectOption) => {
		if (!options || !Array.isArray(options)) return;
		const selectedIds = options.map((opt) => opt.value as string);
		addWarehouses = selectedIds;
		removeWarehouses = removeWarehouses?.filter((id) => !selectedIds.includes(id));
	};
</script>

<Accordion
	header={`${$tranFunc('channel.warehouse')} (${warehousesOfChannel.length})`}
	class="rounded-lg border border-gray-200 bg-white mb-3 p-3"
	open={false}
>
	<Alert variant="info" size="sm" bordered class="mb-3">
		{$tranFunc('channel.warehouseAlert')}
	</Alert>

	{#if $warehousesOfChannelQuery.fetching}
		<SkeletonContainer class="flex items-center gap-1 justify-between">
			<Skeleton class="h-4 w-2/3"></Skeleton>
			<Skeleton class="w-6 h-6 rounded-full"></Skeleton>
		</SkeletonContainer>
	{:else if $warehousesOfChannelQuery.error}
		<Alert variant="error" size="sm" bordered class="mb-3">
			{$warehousesOfChannelQuery.error.message}
		</Alert>
	{:else if $warehousesOfChannelQuery.data?.channel}
		{#each warehousesOfChannel as warehouse, idx (idx)}
			<div class="flex items-center justify-between gap-1 rounded-md py-1 text-sm">
				<span class="truncate">{warehouse.name}</span>
				<IconButton
					icon={Trash}
					size="xs"
					rounded
					variant="light"
					color="red"
					onclick={() => handleDeleteWarehouse(warehouse.id)}
					{disabled}
				/>
			</div>
		{/each}
	{/if}

	<div class="pt-2 mt-2 border-t border-gray-200">
		{#if showAddWarehouses}
			<GraphqlPaginableSelect
				query={WAREHOUSE_LIST_QUERY}
				variables={{ first: BATCH_FETCH }}
				resultKey="warehouses"
				optionValueKey="id"
				optionLabelKey="name"
				requestPolicy="network-only"
				size="sm"
				{disabled}
				label={$tranFunc('channel.selectWh')}
				multiple
				value={addWarehouses}
				onchange={handleAddWarehouses}
			/>
		{/if}

		<Button
			{disabled}
			endIcon={Plus}
			size="xs"
			class="mt-2"
			onclick={() => (showAddWarehouses = true)}
		>
			{$tranFunc('channel.addWh')}
		</Button>
	</div>
</Accordion>
