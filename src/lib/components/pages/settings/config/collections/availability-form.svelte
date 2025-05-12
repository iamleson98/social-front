<script lang="ts">
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { SelectOption } from '$lib/components/ui/select';
	import MultiSelect from '$lib/components/ui/select/multi-select.svelte';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type {
		Channel,
		Collection,
		CollectionChannelListing,
		PublishableChannelListingInput,
		Query
	} from '$lib/gql/graphql';
	import { fade, slide } from 'svelte/transition';

	type Props = {
		addChannelListings?: PublishableChannelListingInput[];
		removeChannels?: string[];
	};

	let { addChannelListings = $bindable([]), removeChannels = $bindable([]) }: Props = $props();

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network'
	});

	let channelsMap = $derived<Record<string, Channel>>(
		$channelsQuery.data?.channels?.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}) || {}
	);
	let selectValues = $state<SelectOption[]>([]);
	const usedChannels: Record<string, boolean> = addChannelListings.reduce(
		(acc, listing) => ({ ...acc, [listing.channelId]: true }),
		{}
	);

	let availableChannels = $derived.by(() => {
		if ($channelsQuery.data) {
			return Object.keys(channelsMap).reduce<SelectOption[]>((acc, cur) => {
				if (!usedChannels[cur])
					acc.push({
						label: channelsMap[cur].name,
						value: channelsMap[cur].id
					});
				return acc;
			}, []);
		}

		return [];
	});

	const handleClickRemoveChannel = (idx: number, item: PublishableChannelListingInput) => {
		addChannelListings = addChannelListings.filter((_, index) => index !== idx);
		removeChannels = removeChannels.concat(item.channelId);
	};

	const handleSelectChannels = () => {
		if (!selectValues?.length) return;

		const addItems = selectValues.map<PublishableChannelListingInput>((val) => ({
			channelId: val.value as string,
			isPublished: true
		}));
		addChannelListings = addChannelListings.concat(addItems);
	};
</script>

<div class="bg-white rounded-lg border w-full border-gray-200 p-3 mb-3">
	<div>
		<div class="text-gray-700 font-semibold">Availability</div>
		<div class="text-xs text-gray-500">In {addChannelListings.length} channels</div>
	</div>

	<div class="mt-2">
		{#if $channelsQuery.fetching}
			<SkeletonContainer>
				<Skeleton class="h-4" />
			</SkeletonContainer>
		{:else if $channelsQuery.error}
			<Alert size="sm" bordered variant="error">{$channelsQuery.error.message}</Alert>
		{:else if $channelsQuery.data}
			<div>
				<MultiSelect
					size="sm"
					options={availableChannels}
					class="w-full"
					bind:value={selectValues}
				/>
				<Button size="xs" variant="light" fullWidth class="mt-2" onclick={handleSelectChannels}
					>Select chanels</Button
				>
			</div>
		{/if}
	</div>
</div>

{#each addChannelListings as listing, idx (idx)}
	<Accordion
		header={channelsMap[listing.channelId].name || listing.channelId}
		class="mb-2 rounded-full bg-white border border-gray-200 p-3"
	>
		<Checkbox bind:checked={listing.isPublished} label="Visible" size="sm" />
		{#if !listing.isPublished}
			<div class="mt-2" transition:slide>
				<EaseDatePicker placeholder="Enter date time" size="xs" label="Publication date" />
			</div>
		{/if}

		<div class="text-right mt-2">
			<Button
				size="xs"
				color="red"
				variant="light"
				startIcon={Trash}
				onclick={() => handleClickRemoveChannel(idx, listing)}>Delete</Button
			>
		</div>
	</Accordion>
{/each}
