<script lang="ts">
	import { tranFunc } from '$i18n';
	import { SHIPPING_ZONES_QUERY } from '$lib/api/admin/channels';
	import { operationStore } from '$lib/api/operation';
	import { Plus, Trash } from '$lib/components/icons';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { MultiSelect } from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Query, QueryShippingZonesArgs, ShippingZone } from '$lib/gql/graphql';
	import { differenceBy } from 'es-toolkit';
	import { onMount } from 'svelte';

	type Props = {
		channelSlug: string;
		addShippingZones: string[];
		removeShippingZones: string[];
	};

	let {
		channelSlug,
		addShippingZones = $bindable([]),
		removeShippingZones = $bindable([])
	}: Props = $props();

	const shippingZonesOfChanelQuery = operationStore<
		Pick<Query, 'shippingZones'>,
		QueryShippingZonesArgs
	>({
		kind: 'query',
		query: SHIPPING_ZONES_QUERY,
		variables: { channel: channelSlug, first: 100 },
		requestPolicy: 'cache-and-network'
	});

	let showAddShippingZones = $state(false);
	let shippingZonesOfChannel = $state.raw<ShippingZone[]>([]);

	const allShippingZones = operationStore<Pick<Query, 'shippingZones'>, QueryShippingZonesArgs>({
		kind: 'query',
		query: SHIPPING_ZONES_QUERY,
		variables: { first: 100 },
		requestPolicy: 'cache-and-network',
		pause: true
	});

	onMount(() => {
		const unsub = shippingZonesOfChanelQuery.subscribe((result) => {
			if (result.data && !result.error) {
				allShippingZones.resume();
				shippingZonesOfChannel = result.data?.shippingZones?.edges.map((edge) => edge.node) || [];
			}
		});

		return unsub;
	});

	const handleDeleteZone = (id: string) => {
		shippingZonesOfChannel = shippingZonesOfChannel.filter((zone) => zone.id !== id);
		if (!removeShippingZones.includes(id)) {
			removeShippingZones = removeShippingZones.concat(id);
		}
	};
</script>

<div>
	{#if $shippingZonesOfChanelQuery.fetching}
		<SkeletonContainer class="flex items-center gap-1 justify-between">
			<Skeleton class="h-4 w-2/3"></Skeleton>
			<Skeleton class="w-6 h-6 rounded-full"></Skeleton>
		</SkeletonContainer>
	{:else if $shippingZonesOfChanelQuery.error}
		<Alert variant="error" size="sm" bordered class="mb-3">
			{$tranFunc('error.failedToLoad')}
		</Alert>
	{:else if $shippingZonesOfChanelQuery.data?.shippingZones}
		<Accordion
			open
			header="Shipping zones ({shippingZonesOfChannel.length})"
			class="rounded-lg border border-gray-200 bg-white mb-3"
		>
			<Alert variant="info" size="sm" bordered class="mb-3">
				Select shipping zones that will be supplied via this channel. You can assign shipping zones
				to multiple channels.
			</Alert>

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
					/>
				</div>
			{/each}

			{#if $allShippingZones.data?.shippingZones?.edges.length}
				<div class="pt-2 mt-2 border-t border-gray-200">
					{#if showAddShippingZones}
						{@const allZones = $allShippingZones.data?.shippingZones?.edges.map(
							(edge) => edge.node
						)}
						{@const availableZones = differenceBy(
							allZones,
							shippingZonesOfChannel,
							(zone) => zone.id
						).map((zone) => ({
							label: zone.name,
							value: zone.id
						}))}
						<MultiSelect
							size="sm"
							options={availableZones}
							label="Select Shipping Zone"
							class="mb-2 w-full"
							onchange={(opts) =>
								(addShippingZones = opts?.map((opt) => opt.value as string) || [])}
						/>
					{/if}
					<Button endIcon={Plus} size="xs" onclick={() => (showAddShippingZones = true)}
						>Add Shipping Zone</Button
					>
				</div>
			{:else if $allShippingZones.error}
				<Alert variant="warning" size="xs" bordered>
					{$tranFunc('error.failedToLoad')}
				</Alert>
			{/if}
		</Accordion>
	{/if}
</div>
