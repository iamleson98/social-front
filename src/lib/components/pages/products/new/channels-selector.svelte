<script lang="ts">
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox, Label } from '$lib/components/ui/Input';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type {
		ProductChannelListing,
		ProductChannelListingAddInput,
		ProductChannelListingUpdateInput,
		Query
	} from '$lib/gql/graphql';
	import { tranFunc } from '$lib/i18n';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import ErrorMsg from './error-msg.svelte';

	type Props = {
		/**
		 * When update exiting product, caller will provide existing channel listings
		 */
		channelListings?: ProductChannelListing[];
		channelListingUpdateInput: ProductChannelListingUpdateInput;
		ok: boolean;
	};

	let { channelListings, channelListingUpdateInput = $bindable({}), ok }: Props = $props();
	// map of channels that are already assigned to a product
	const ASSIGNED_CHANNEL_IDS_MAP: Record<string, boolean> = channelListings?.length
		? channelListings.reduce((acc, cur) => ({ ...acc, [cur.channel.id]: true }), {})
		: {};

	const CHANNELS_QUERY_STORE = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network'
	});

	type CustomChannelListingAddInput = ProductChannelListingAddInput & {
		used: boolean; // for checkbox binding
		channelName: string; // for label displaying
		currency: string;
	};

	type CustomProductChannelListingUpdateInput = {
		removeChannels: string[];
		updateChannels: CustomChannelListingAddInput[];
	};

	let productChannelListingUpdateInput = $state<CustomProductChannelListingUpdateInput>({
		updateChannels: [],
		removeChannels: []
	});

	$effect(() => {
		channelListingUpdateInput = {
			...productChannelListingUpdateInput,
			updateChannels: productChannelListingUpdateInput.updateChannels.filter((chan) => chan.used)
		};
	});

	onMount(() => {
		const populatedChanelMap: Record<string, boolean> = {};

		// if the product already has channel listings, populate the map
		if (channelListings?.length) {
			productChannelListingUpdateInput = {
				...productChannelListingUpdateInput,
				updateChannels: channelListings.map((listing) => {
					populatedChanelMap[listing.channel.id] = true;

					return {
						channelId: listing.channel.id,
						used: ASSIGNED_CHANNEL_IDS_MAP[listing.channel.id],
						channelName: listing.channel.name,
						currency: listing.channel.currencyCode.toUpperCase(),

						availableForPurchaseAt: listing.availableForPurchaseAt,
						isAvailableForPurchase: listing.isAvailableForPurchase,
						isPublished: listing.isPublished,
						publishedAt: listing.publishedAt,
						visibleInListings: listing.visibleInListings
					};
				})
			};
		}

		// add not added channel(s) to the list for user to use
		return CHANNELS_QUERY_STORE.subscribe((result) => {
			if (preHandleErrorOnGraphqlResult(result)) return;

			const newChannelListings = productChannelListingUpdateInput.updateChannels;
			for (const chan of result.data?.channels || []) {
				if (!populatedChanelMap[chan.id]) {
					populatedChanelMap[chan.id] = true; // prevent adding again

					newChannelListings.push({
						channelId: chan.id,
						used: false,
						channelName: chan.name,
						isPublished: true,
						isAvailableForPurchase: true,
						currency: chan.currencyCode.toUpperCase()
					});
				}
			}

			productChannelListingUpdateInput = {
				...productChannelListingUpdateInput,
				updateChannels: newChannelListings
			};
		});
	});

	/**
	 * This happens when update product, user want to stop selling in specific channel
	 */
	const toggleSelectChannel = (channelID: string, checked: boolean) => {
		if (!checked && ASSIGNED_CHANNEL_IDS_MAP[channelID]) {
			productChannelListingUpdateInput = {
				updateChannels: productChannelListingUpdateInput.updateChannels.filter(
					(chan) => chan.channelId !== channelID
				),
				removeChannels: productChannelListingUpdateInput.removeChannels.concat(channelID)
			};
		}
	};
</script>

<div class="mb-3">
	<Label required requiredAtPos="end" label={$tranFunc('product.channel')} />

	<div
		class="rounded-lg p-3 border flex items-start gap-2 flex-nowrap tablet:flex-wrap {!ok
			? 'bg-red-50 border-red-200'
			: 'bg-gray-50 border-gray-200'}"
	>
		{#if $CHANNELS_QUERY_STORE.fetching}
			<SkeletonContainer class="w-1/2">
				<Skeleton class="h-6 w-full" />
			</SkeletonContainer>
		{:else if $CHANNELS_QUERY_STORE.error}
			<Alert variant="error" size="sm" bordered>{$CHANNELS_QUERY_STORE.error.message}</Alert>
		{:else}
			{#each productChannelListingUpdateInput.updateChannels! as channelListing, idx (idx)}
				{#snippet channelHead()}
					<Checkbox
						label={channelListing.channelName}
						bind:checked={channelListing.used}
						onchange={(evt) =>
							toggleSelectChannel(channelListing.channelId, evt.currentTarget.checked)}
					/>
				{/snippet}

				<div class="w-1/4 tablet:w-1/3 mobile-l:w-full">
					<Accordion
						header={channelHead}
						open={channelListing.used}
						class="p-2 rounded-lg bg-white border border-gray-200"
					>
						<Checkbox
							bind:checked={channelListing.isPublished}
							size="sm"
							label={$tranFunc('product.published')}
							class="mb-2"
						/>
						{#if !channelListing.isPublished}
							<div transition:fade class="mb-2 pb-2 border-b border-gray-300">
								<EaseDatePicker
									size="xs"
									onchange={(value) => (channelListing.publishedAt = value.date)}
									allowSelectMonthYears={{
										showYears: { min: 2020 },
										showMonths: true
									}}
									label={$tranFunc('product.promptPublicationTime')}
								/>
							</div>
						{/if}
						<Checkbox
							bind:checked={channelListing.isAvailableForPurchase}
							size="sm"
							label={$tranFunc('product.availForPurchase')}
							class="mb-2"
						/>
						{#if !channelListing.isAvailableForPurchase}
							<div transition:fade>
								<EaseDatePicker
									label={$tranFunc('product.promptAvailTime')}
									size="xs"
									onchange={(value) => (channelListing.availableForPurchaseAt = value.date)}
									allowSelectMonthYears={{
										showYears: { min: 2020 },
										showMonths: true
									}}
								/>
							</div>
						{/if}
					</Accordion>
				</div>
			{/each}
		{/if}
	</div>
	<ErrorMsg error={!ok ? $tranFunc('error.thereIsError') : undefined} />
</div>
