<script lang="ts">
	import { CHANNEL_WAREHOUSES_QUERY, WAREHOUSES_QUERY } from '$lib/api/admin/channels';
	import { operationStore } from '$lib/api/operation';
	import { Plus, Trash } from '$lib/components/icons';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { MultiSelect, type SelectOption } from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Query, QueryChannelArgs, QueryWarehousesArgs, Warehouse } from '$lib/gql/graphql';
	import { differenceBy } from 'es-toolkit';
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
		disabled
	}: Props = $props();

	const BATCH_FETCH = 100;

	let showAddWarehouses = $state(false);
	let warehousesOfChannel = $state.raw<Warehouse[]>([]);

	const warehousesOfChannelQuery = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		kind: 'query',
		query: CHANNEL_WAREHOUSES_QUERY,
		variables: {
			slug: channelSlug,
			first: BATCH_FETCH
		},
		requestPolicy: 'network-only',
		pause: !channelSlug // don't call this when in channel creation page
	});

	const allWarehouses = operationStore<Pick<Query, 'warehouses'>, QueryWarehousesArgs>({
		kind: 'query',
		query: WAREHOUSES_QUERY,
		variables: { first: BATCH_FETCH },
		requestPolicy: 'network-only',
		pause: true // only call when user want to add new warehouses
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

	const handleClickAddWarehouseButton = () => {
		showAddWarehouses = true;
		allWarehouses.resume();
	};

	const handleAddWarehouses = (options: SelectOption[] | undefined) => {
		if (!options) return;
		const selectedIds = options.map((opt) => opt.value as string);
		addWarehouses = selectedIds;
		removeWarehouses = removeWarehouses?.filter((id) => !selectedIds.includes(id));
	};
</script>

<Accordion
	header="Warehouses ({warehousesOfChannel.length})"
	class="rounded-lg border border-gray-200 bg-white mb-3"
	open={false}
>
	<Alert variant="info" size="sm" bordered class="mb-3">
		Assign and sort warehouses that will be used in this channel (warehouses can be assigned in
		multiple channels).
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
			{#if $allWarehouses.data?.warehouses}
				{@const allWh = $allWarehouses.data?.warehouses?.edges.map((edge) => edge.node)}
				{@const availableWarehouses = differenceBy(
					allWh,
					warehousesOfChannel,
					(warehouse) => warehouse.id
				).map((warehouse) => ({
					label: warehouse.name,
					value: warehouse.id
				}))}
				<MultiSelect
					size="sm"
					options={availableWarehouses}
					{disabled}
					label="Select Warehouse"
					class="mb-2 w-full"
					onchange={handleAddWarehouses}
				/>
			{:else if $allWarehouses.fetching}
				<SkeletonContainer class="mb-2">
					<Skeleton class="h-4 w-full"></Skeleton>
				</SkeletonContainer>
			{:else if $allWarehouses.error}
				<Alert variant="error" size="sm" bordered>
					{$allWarehouses.error.message}
				</Alert>
			{/if}
		{/if}

		<Button {disabled} endIcon={Plus} size="xs" onclick={handleClickAddWarehouseButton}>
			Add Warehouse
		</Button>
	</div>
</Accordion>
