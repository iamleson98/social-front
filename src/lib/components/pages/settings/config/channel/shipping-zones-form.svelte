<script lang="ts">
	import { SHIPPING_ZONES_QUERY } from '$lib/api/admin/channels';
	import { operationStore } from '$lib/api/operation';
	import { Plus, Trash } from '$lib/components/icons';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Query, QueryShippingZonesArgs, ShippingZone } from '$lib/gql/graphql';
	import { onMount } from 'svelte';

	type Props = {
		/**if not provided, meaning new channel creation page*/
		channelSlug?: string;
		addShippingZones: string[];
		/**if not provided, meaning new channel creation page*/
		removeShippingZones?: string[];
		disabled: boolean;
	};

	let {
		channelSlug,
		addShippingZones = $bindable([]),
		removeShippingZones = $bindable(),
		disabled,
	}: Props = $props();

	const BATCH = 100;

	const shippingZonesOfChanelQuery = operationStore<
		Pick<Query, 'shippingZones'>,
		QueryShippingZonesArgs
	>({
		kind: 'query',
		query: SHIPPING_ZONES_QUERY,
		variables: { channel: channelSlug, first: BATCH },
		requestPolicy: 'network-only',
		pause: true,
	});

	let showAddShippingZones = $state(false);
	let shippingZonesOfChannel = $state.raw<ShippingZone[]>([]);

	onMount(() => {
		if (channelSlug) {
			shippingZonesOfChanelQuery.resume();

			return shippingZonesOfChanelQuery.subscribe((result) => {
				if (result.data?.shippingZones) {
					shippingZonesOfChannel = result.data?.shippingZones?.edges.map((edge) => edge.node) || [];
				}
			});
		}
	});

	const handleDeleteZone = (id: string) => {
		shippingZonesOfChannel = shippingZonesOfChannel.filter((zone) => zone.id !== id);
		if (!removeShippingZones?.includes(id)) {
			removeShippingZones = removeShippingZones?.concat(id);
		}
	};

	const handleAddShippingZones = (options?: SelectOption[] | SelectOption) => {
		if (!options || !Array.isArray(options)) return;

		const selectedIds = options.map((opt) => opt.value as string);
		addShippingZones = selectedIds;
		removeShippingZones = removeShippingZones?.filter((id) => !selectedIds.includes(id));
	};
</script>

<Accordion
	open
	header="Shipping zones ({shippingZonesOfChannel.length})"
	class="rounded-lg border border-gray-200 bg-white mb-3 p-3"
>
	<Alert variant="info" size="sm" bordered class="mb-3">
		Select shipping zones that will be supplied via this channel. You can assign shipping zones to
		multiple channels.
	</Alert>

	{#if $shippingZonesOfChanelQuery.fetching}
		<SkeletonContainer class="flex items-center gap-1 justify-between">
			<Skeleton class="h-4 w-2/3"></Skeleton>
			<Skeleton class="w-6 h-6 rounded-full"></Skeleton>
		</SkeletonContainer>
	{:else if $shippingZonesOfChanelQuery.error}
		<Alert variant="error" size="sm" bordered class="mb-3">
			{$shippingZonesOfChanelQuery.error.message}
		</Alert>
	{:else if $shippingZonesOfChanelQuery.data?.shippingZones}
		{#each shippingZonesOfChannel as zone, idx (idx)}
			<div class="flex items-center justify-between gap-1 rounded-md py-1 text-sm">
				<span class="truncate">{zone.name}</span>
				<IconButton
					icon={Trash}
					size="xs"
					rounded
					variant="light"
					color="red"
					onclick={() => handleDeleteZone(zone.id)}
					{disabled}
				/>
			</div>
		{/each}
	{/if}

	<div class="pt-2 mt-2 border-t border-gray-200">
		{#if showAddShippingZones}
			<GraphqlPaginableSelect
				query={SHIPPING_ZONES_QUERY}
				variables={{ first: 20 }}
				resultKey="shippingZones"
				optionValueKey="id"
				optionLabelKey="name"
				requestPolicy="network-only"
				size="sm"
				{disabled}
				label="Select Shipping Zone"
				multiple
				value={addShippingZones}
				onchange={handleAddShippingZones}
				bind:forceFetching={showAddShippingZones}
			/>
		{/if}

		<Button
			endIcon={Plus}
			size="xs"
			class="mt-2"
			{disabled}
			onclick={() => (showAddShippingZones = true)}
		>
			Add Shipping Zone
		</Button>
	</div>
</Accordion>
