<script lang="ts">
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { SelectOption } from '$lib/components/ui/select';
	import MultiSelect from '$lib/components/ui/select/multi-select.svelte';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type {
		Collection,
		CollectionChannelListing,
		Query,
	} from '$lib/gql/graphql';

	type Props = {
		collection?: Collection;
		channelListings?: CollectionChannelListing[];
	};

	let { channelListings = [] }: Props = $props();

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network',
		pause: true
	});

	let availableChannels = $derived.by(() => {
		if ($channelsQuery.data) {
			const usedChannels: Record<string, boolean> = channelListings.reduce(
				(acc, listing) => ({ ...acc, [listing.channel.id]: true }),
				{}
			);

			return (
				$channelsQuery.data.channels?.reduce<SelectOption[]>((acc, chan) => {
					if (!usedChannels[chan.id]) {
						acc.push({
							value: chan.id,
							label: chan.name
						});
					}
					return acc;
				}, []) || []
			);
		}

		return [];
	});

	const handleClickSelectChannels = () => {
		channelsQuery.resume();
	};
</script>

<div class="bg-white rounded-lg border w-full border-gray-200 p-3 mb-3">
	<div class="flex items-center justify-between">
		<div>
			<div class="text-gray-700 font-semibold">Availability</div>
			<div class="text-xs text-gray-500">In {channelListings.length} channels</div>
		</div>

		<Button variant="light" size="xs" onclick={handleClickSelectChannels}>Manage</Button>
	</div>

	<div class="mt-2">
		{#if $channelsQuery.fetching}
			<SkeletonContainer>
				<Skeleton class="h-4" />
			</SkeletonContainer>
		{:else if $channelsQuery.error}
			<Alert size="sm" bordered variant="error">{$channelsQuery.error.message}</Alert>
		{:else if $channelsQuery.data}
			<MultiSelect size="sm" options={availableChannels} />
		{/if}
	</div>
</div>

{#each channelListings as listing, idx (idx)}
	<Accordion
		header={listing.channel.name}
		class="mb-2 rounded-full bg-white border border-gray-200"
	>
		<Checkbox bind:checked={listing.isPublished} label="Visible" size="sm" />
		{#if !listing.isPublished}
			<div class="mt-2">
				<EaseDatePicker placeholder="Enter date time" size="sm" />
			</div>
		{/if}
	</Accordion>
{/each}
