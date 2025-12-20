<script lang="ts">
	import { T } from '$i18n';
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox } from '$lib/components/ui/Input';
	import { Skeleton } from '$lib/components/ui/Skeleton';
	import { Select, SelectSkeleton, type SelectOption } from '$lib/components/ui/select';
	import type { Channel, PublishableChannelListingInput, Query } from '$lib/gql/graphql';
	import { THIS_TIME_LAST_5_YEARS, THIS_TIME_NEXT_5_YEARS } from '$lib/utils/consts';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	type Props = {
		addChannelListings?: PublishableChannelListingInput[];
		removeChannels?: string[];
		disabled?: boolean;
	};

	let {
		addChannelListings = $bindable([]),
		removeChannels = $bindable([]),
		disabled,
	}: Props = $props();

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network',
	});

	/**
	 * this const keeps track of existing channel usage from backend
	 */
	const existingChannelUsageMap = addChannelListings.reduce(
		(acc, cur) => {
			acc[cur.channelId] = true;
			return acc;
		},
		{} as Record<string, boolean>,
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
			{} as Record<string, boolean>,
		),
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
						label: chan.name,
					});
				}

				channelsMap = newChannelMap;
				channelSelectOptions = newChannelSelectOption;

				// display existing selected channel options
				selectValues = addChannelListings.map((listing) => ({
					value: listing.channelId,
					label: channelsMap[listing.channelId].name,
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
					isPublished: true, // for default
				});
			}
		}

		addChannelListings = newChannelListings;
	};

	const removeChannelListing = (idx: number) => {
		handleSelectionChange(selectValues.filter((_, i) => i !== idx));
	};
</script>

<div class={['w-3/10 tablet:w-full space-y-2']}>
	{#if $channelsQuery.fetching}
		<div class={SitenameCommonClassName}>
			<Skeleton class="h-8 w-28 mb-2" />
			<SelectSkeleton label size="sm" />
		</div>
	{:else if $channelsQuery.error}
		<Alert size="sm" bordered variant="error">{$channelsQuery.error.message}</Alert>
	{:else if $channelsQuery.data}
		<div class={SitenameCommonClassName}>
			<SectionHeader>{$T('settings.availability')}</SectionHeader>
			<div class="text-xs text-gray-500">
				{addChannelListings.length}
				{$T('settings.availability')}
			</div>
			<Select
				size="sm"
				options={channelSelectOptions}
				multiple
				value={selectValues.map((opt) => opt.value)}
				onchange={(opts) => handleSelectionChange(opts as SelectOption[])}
				{disabled}
			/>
		</div>

		{#each addChannelListings as listing, idx (idx)}
			<Accordion
				header={channelsMap[listing.channelId]?.name || listing.channelId}
				class={SitenameCommonClassName}
			>
				<Checkbox
					bind:checked={listing.isPublished}
					label={$T('common.visible')}
					size="sm"
					{disabled}
				/>
				{#if !listing.isPublished}
					<div class="mt-2" transition:slide>
						<EaseDatePicker
							placeholder={$T('common.publicationDate')}
							size="sm"
							label={$T('common.publicationDate')}
							value={{ date: listing.publishedAt }}
							onchange={(val) => (listing.publishedAt = dayjs(val.date).format(RFC3339TimeFormat))}
							{disabled}
							timeConfig={{
								stepMinutes: 1,
								format: 24,
								stepHours: 1,
							}}
							allowSelectMonthYears={{
								showMonths: true,
								showResetBtn: true,
								showYears: {
									min: THIS_TIME_LAST_5_YEARS.year(),
									max: THIS_TIME_NEXT_5_YEARS.year(),
								},
							}}
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
						onclick={() => removeChannelListing(idx)}
					>
						{$T('btn.delete')}
					</Button>
				</div>
			</Accordion>
		{/each}
	{/if}
</div>
