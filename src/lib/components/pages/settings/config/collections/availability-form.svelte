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
	import type { Channel, PublishableChannelListingInput, Query } from '$lib/gql/graphql';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import SectionHeader from '$lib/components/common/section-header.svelte';

	type Props = {
		addChannelListings?: PublishableChannelListingInput[];
		removeChannels?: string[];
		disabled?: boolean;
	};

	let {
		addChannelListings = $bindable([]),
		removeChannels = $bindable([]),
		disabled
	}: Props = $props();

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY,
		requestPolicy: 'network-only'
	});

	/**
	 * this const keeps track of existing channel usage from backend
	 */
	const existingChannelUsageMap = addChannelListings.reduce(
		(acc, cur) => {
			acc[cur.channelId] = true;
			return acc;
		},
		{} as Record<string, boolean>
	);

	/** keys are channel ids, values are channels themself */
	let channelsMap = $state.raw<Record<string, Channel>>({});
	let selectValues = $state.raw<SelectOption[]>([]);
	let channelSelectOptions = $state.raw<SelectOption[]>([]);
	let usedChanelsMap = $derived<Record<string, boolean>>(
		addChannelListings.reduce(
			(acc, listing) => {
				acc[listing.channelId] = true;
				return acc;
			},
			{} as Record<string, boolean>
		)
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

	const handleSelectionChange = (values?: SelectOption[]) => {
		if (!values) return;

		selectValues = values;
		let newChannelListings = [...addChannelListings];

		// keep listings that is selected only
		newChannelListings = newChannelListings.filter((listing) => {
			const useListing = selectValues.some((val) => val.value === listing.channelId);

			if (
				!useListing &&
				existingChannelUsageMap[listing.channelId] &&
				!removeChannels.includes(listing.channelId)
			) {
				removeChannels.push(listing.channelId);
			}

			return useListing;
		});

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

	const removeChannelListing = (idx: number) => {
		handleSelectionChange(selectValues.filter((_, i) => i !== idx));
	};
</script>

<div>
	{#if $channelsQuery.fetching}
		<SkeletonContainer>
			<Skeleton class="h-4" />
		</SkeletonContainer>
	{:else if $channelsQuery.error}
		<Alert size="sm" bordered variant="error">{$channelsQuery.error.message}</Alert>
	{:else if $channelsQuery.data}
		<div class="bg-white rounded-lg border w-full border-gray-200 p-3 mb-3">
			<SectionHeader title="Availability" />
			<div class="text-xs text-gray-500">In {addChannelListings.length} channels</div>
			<MultiSelect
				size="sm"
				options={channelSelectOptions}
				class="w-full mt-2"
				value={selectValues}
				onchange={handleSelectionChange}
				{disabled}
			/>
		</div>

		{#each addChannelListings as listing, idx (idx)}
			<Accordion
				header={channelsMap[listing.channelId]?.name || listing.channelId}
				class="mb-2 rounded-full bg-white border border-gray-200 p-3"
			>
				<Checkbox bind:checked={listing.isPublished} label="Visible" size="sm" {disabled} />
				{#if !listing.isPublished}
					<div class="mt-2" transition:slide>
						<EaseDatePicker
							placeholder="Enter date time"
							size="sm"
							label="Publication date"
							value={{ date: listing.publishedAt }}
							onchange={(val) => (listing.publishedAt = dayjs(val.date).format())}
							{disabled}
						/>
					</div>
				{/if}
				<div class="text-right mt-2">
					<Button
						size="xs"
						variant="light"
						color="red"
						startIcon={Trash}
						{disabled}
						onclick={() => removeChannelListing(idx)}>Remove</Button
					>
				</div>
			</Accordion>
		{/each}
	{/if}
</div>
