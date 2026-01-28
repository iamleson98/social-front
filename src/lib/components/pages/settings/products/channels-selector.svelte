<script lang="ts">
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox, Label } from '$lib/components/ui/Input';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import type {
		ProductChannelListing,
		ProductChannelListingAddInput,
		ProductChannelListingUpdateInput,
		Query,
	} from '$lib/gql/graphql';
	import { T } from '$lib/i18n';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import ErrorMsg from './error-msg.svelte';
	import type { ChannelSelectOptionProps } from './utils';
	import dayjs from 'dayjs';
	import { difference } from 'es-toolkit';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	type Props = {
		/**
		 * When update exiting product, caller will provide existing channel listings
		 */
		channelListings?: ProductChannelListing[];
		channelListingUpdateInput: ProductChannelListingUpdateInput;
		ok: boolean;
		loading: boolean;
		channelSelectOptions: ChannelSelectOptionProps[];
	};

	type CustomProductChannelListing = ProductChannelListing & {
		used: boolean;
		channelName: string;
		currency: string;
	};

	let {
		channelListings = [],
		channelListingUpdateInput = $bindable({}),
		ok = $bindable(),
		loading,
		channelSelectOptions = $bindable(),
	}: Props = $props();
	// map of channels that are already assigned to a product
	const AssignedChannelIdsMap: Record<string, ProductChannelListing> = (
		channelListings || []
	).reduce((acc, cur) => ({ ...acc, [cur.channel.id]: cur }), {});
	const ExistingChannelIds = channelListings?.map((listing) => listing.channel.id) || [];
	let activeChannelListings = $state<CustomProductChannelListing[]>([]);

	const ChannelsQueryStore = operationStore<Pick<Query, 'channels'>>({
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network',
	});

	/** listen on activeListings changes, then re-calculate productChannelListingUpdateInput */
	$effect(() => {
		const remainChannelListingIds = activeChannelListings.reduce((acc, cur) => {
			if (cur.used && cur.id) acc.push(cur.channel.id);
			return acc;
		}, [] as string[]);

		channelListingUpdateInput.removeChannels = difference(
			ExistingChannelIds,
			remainChannelListingIds,
		);

		// also recalculate channelSelectOptions for variant editor
		const newChannelSelectOptions: ChannelSelectOptionProps[] = [];

		channelListingUpdateInput.updateChannels = activeChannelListings.reduce((acc, cur) => {
			if (cur.used) {
				const value: ProductChannelListingAddInput = {
					channelId: cur.channel.id,
					isPublished: cur.isPublished,
					isAvailableForPurchase: cur.isAvailableForPurchase,
					availableForPurchaseAt: cur.availableForPurchaseAt,
					publishedAt: cur.publishedAt,
					visibleInListings: cur.visibleInListings,
				};

				acc.push(value);
				newChannelSelectOptions.push({
					value: cur.channel.id,
					label: cur.channel.name,
					currency: cur.channel.currencyCode,
					channelId: cur.channel.id,
					price: undefined,
				});
			}

			return acc;
		}, [] as ProductChannelListingAddInput[]);

		channelSelectOptions = newChannelSelectOptions;
	});

	onMount(() =>
		ChannelsQueryStore.subscribe((result) => {
			if (checkIfGraphqlResultHasError(result)) return;

			const newActiveChannelListings = [];

			for (const channel of result.data?.channels || []) {
				const listing: CustomProductChannelListing = {
					id: '',
					channel,
					isPublished: false,
					visibleInListings: false,
					used: false,
					channelName: channel.name,
					currency: channel.currencyCode,
				};

				const assignedListing = AssignedChannelIdsMap[channel.id];

				if (assignedListing) {
					listing.used = true;
					listing.id = assignedListing.id;
					listing.isPublished = assignedListing.isPublished;
					listing.isAvailableForPurchase = assignedListing.isAvailableForPurchase;
					listing.publishedAt = assignedListing.publishedAt;
					listing.availableForPurchaseAt = assignedListing.availableForPurchaseAt;
					listing.visibleInListings = assignedListing.visibleInListings;
				}

				newActiveChannelListings.push(listing);
			}

			activeChannelListings = newActiveChannelListings;
		}),
	);
</script>

<div>
	<Label required requiredAtPos="end" label={$T('product.channel')} />

	{#if $ChannelsQueryStore.fetching}
		<TableSkeleton numOfRows={2} numColumns={4} />
	{:else if $ChannelsQueryStore.error}
		<Alert variant="error" size="sm" bordered>{$ChannelsQueryStore.error.message}</Alert>
	{:else}
		<div class={['grid grid-cols-4 gap-2']}>
			{#each activeChannelListings as listing, idx (idx)}
				<div class="space-y-2 rounded-lg bg-white border border-gray-200 h-fit">
					<!-- general channel use select checkbox -->
					<div class="bg-gray-100 p-2">
						<Checkbox
							label={listing.channel.name}
							checked={listing.used}
							disabled={loading}
							size="sm"
							onCheckChange={(checked) => {
								listing.used = checked;
								listing.visibleInListings = checked;
								listing.isPublished = checked;
								listing.isAvailableForPurchase = checked;
							}}
						/>
					</div>

					<!-- published checkbox -->
					<div class="p-2 space-y-2">
						<Checkbox
							bind:checked={listing.isPublished}
							onCheckChange={(checked) => checked && (listing.publishedAt = undefined)}
							size="sm"
							label={$T('product.published')}
							class="mb-2"
							disabled={loading || !listing.used}
						/>
						{#if listing.used && !listing.isPublished}
							<div transition:fade class="mb-2 pb-2 border-b border-gray-300">
								<EaseDatePicker
									size="xs"
									onchange={(value) => {
										listing.publishedAt = dayjs(value.date).format(RFC3339TimeFormat);
									}}
									value={{ date: listing.publishedAt }}
									allowSelectMonthYears={{
										showYears: { min: 2020 },
										showMonths: true,
									}}
									label={$T('product.promptPublicationTime')}
									disabled={loading}
								/>
							</div>
						{/if}

						<!-- available for purchase checkbox -->
						<Checkbox
							bind:checked={listing.isAvailableForPurchase}
							size="sm"
							label={$T('product.availForPurchase')}
							class="mb-2"
							disabled={loading || !listing.used}
							onCheckChange={(checked) => checked && (listing.availableForPurchaseAt = undefined)}
						/>
						{#if listing.used && !listing.isAvailableForPurchase}
							<div transition:fade>
								<EaseDatePicker
									label={$T('product.promptAvailTime')}
									size="xs"
									onchange={(value) => {
										listing.availableForPurchaseAt = dayjs(value.date).format(RFC3339TimeFormat);
									}}
									value={{ date: listing.availableForPurchaseAt }}
									allowSelectMonthYears={{
										showYears: { min: 2020 },
										showMonths: true,
									}}
									disabled={loading}
								/>
							</div>
						{/if}

						<!-- visible in listing checkbox -->
						<Checkbox
							bind:checked={listing.visibleInListings}
							size="sm"
							label={$T('product.visibleInListing')}
							class="mb-2"
							disabled={loading || !listing.used}
							subText={$T('product.visibleInListingHint')}
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
<ErrorMsg error={!ok ? $T('error.thereIsError') : undefined} />
