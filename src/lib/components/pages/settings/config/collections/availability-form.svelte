<script lang="ts">
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { SelectOption } from '$lib/components/ui/select';
	import MultiSelect from '$lib/components/ui/select/multi-select.svelte';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type {
		Channel,
		PublishableChannelListingInput,
		Query
	} from '$lib/gql/graphql';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

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

	/** keys are channel ids, values are channels themself */
	let channelsMap = $state.raw<Record<string, Channel>>({});
	let selectValues = $state.raw<SelectOption[]>([]);
	let channelSelectOptions = $state.raw<SelectOption[]>([]);
	let usedChanelsMap: Record<string, boolean> = $derived(
		addChannelListings.reduce((acc, listing) => ({ ...acc, [listing.channelId]: true }), {})
	);

	onMount(() => {
		return channelsQuery.subscribe((result) => {
			if (result.data?.channels) {
				const newChannelMap: Record<string, Channel> = {};
				const newChannelSelectOption: SelectOption[] = [];

				for (const chan of result.data.channels) {
					newChannelMap[chan.id] = chan;
					newChannelSelectOption.push({
						value: chan.id,
						label: chan.name
					});
				}

				channelsMap = newChannelMap;
				channelSelectOptions = newChannelSelectOption;

				// display existing selected channel options
				selectValues = addChannelListings.map((listing) => ({
					value: listing.channelId,
					label: channelsMap[listing.channelId].name
				}));
			}
		});
	});

	const handleSelectionCHange = (values?: SelectOption[]) => {
		if (!values) return;
		selectValues = values;

		let newChannelListings = [...addChannelListings];

		newChannelListings = newChannelListings.filter((listing) =>
			selectValues.some((val) => val.value === listing.channelId)
		);

		for (const opt of selectValues) {
			if (!usedChanelsMap[opt.value]) {
				newChannelListings.push({
					channelId: opt.value as string,
					isPublished: true // for default
				});
			}
		}

		addChannelListings = newChannelListings;
	};
</script>

<div class="">
	<div class="bg-white rounded-lg border w-full border-gray-200 p-3 mb-3">
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
			<div class="bg-white rounded-lg border w-full border-gray-200 p-3 mb-3">
				<MultiSelect
					size="sm"
					options={channelSelectOptions}
					class="w-full"
					value={selectValues}
					onchange={handleSelectionCHange}
				/>
			</div>

			{#each addChannelListings as listing, idx (idx)}
				<Accordion
					header={channelsMap[listing.channelId].name}
					class="mb-2 rounded-full bg-white border border-gray-200 p-3"
				>
					<Checkbox bind:checked={listing.isPublished} label="Visible" size="sm" />
					{#if !listing.isPublished}
						<div class="mt-2" transition:slide>
							<EaseDatePicker placeholder="Enter date time" size="xs" label="Publication date" />
						</div>
					{/if}
				</Accordion>
			{/each}
		{/if}
	</div>
</div>
