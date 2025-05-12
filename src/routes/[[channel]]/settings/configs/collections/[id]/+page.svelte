<script lang="ts">
	import { page } from '$app/state';
	import { COLLECTION_DETAIL_QUERY } from '$lib/api/admin/collections';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import AvailabilityForm from '$lib/components/pages/settings/config/collections/availability-form.svelte';
	import GeneralInformationForm from '$lib/components/pages/settings/config/collections/general-information-form.svelte';
	import ProductListForm from '$lib/components/pages/settings/config/collections/product-list-form.svelte';
	import SeoForm from '$lib/components/pages/settings/config/collections/seo-form.svelte';
	import { type MediaObject } from '$lib/components/pages/settings/products/new/utils';
	import { Alert } from '$lib/components/ui/Alert';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type {
		CollectionChannelListingUpdateInput,
		CollectionInput,
		MetadataInput,
		Query,
		QueryCollectionArgs,
		SeoInput
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	const onDeleteClick = () => {};

	const onUpdateClick = () => {};

	let collectionUpdateinput = $state<CollectionInput>({
		name: '',
		description: '',
		slug: '',
		seo: {
			title: '',
			description: ''
		},
		metadata: [],
		privateMetadata: []
	});
	let media = $state<MediaObject>();
	let generalFormOk = $state(false);
	let seoFormOk = $state(false);
	let collectionChannelListingUpdateInput = $state<CollectionChannelListingUpdateInput>({
		addChannels: [],
		removeChannels: []
	});

	const collectionDetail = operationStore<Pick<Query, 'collection'>, QueryCollectionArgs>({
		kind: 'query',
		query: COLLECTION_DETAIL_QUERY,
		variables: {
			id: page.params.id
		}
	});

	$effect(() => {
		if ($collectionDetail.data?.collection) {
			const {
				name,
				slug,
				description,
				backgroundImage,
				seoTitle,
				seoDescription,
				metadata,
				privateMetadata,
				channelListings
			} = $collectionDetail.data.collection;
			collectionUpdateinput = {
				name,
				slug,
				description: description ? JSON.parse(description) : undefined,
				seo: {
					title: seoTitle,
					description: seoDescription
				},
				metadata,
				privateMetadata
			};
			if (backgroundImage)
				media = {
					alt: backgroundImage.alt || '',
					url: backgroundImage.url
				};

			if (channelListings?.length) {
				collectionChannelListingUpdateInput.addChannels = channelListings.map((item) => ({
					channelId: item.channel.id,
					isPublished: item.isPublished,
					publishedAt: item.publishedAt
				}));
			}
		}
	});
</script>

{#if $collectionDetail.fetching}
	<SkeletonContainer>
		<Skeleton class="h-10" />
	</SkeletonContainer>
{:else if $collectionDetail.error}
	<Alert variant="error" size="sm" bordered>
		{$collectionDetail.error.message}
	</Alert>
{:else if $collectionDetail.data}
	<div class="flex gap-2 flex-row">
		<div class="w-7/10 flex flex-col gap-2">
			<GeneralInformationForm
				bind:name={collectionUpdateinput.name as string}
				bind:description={collectionUpdateinput.description as string}
				bind:metadata={collectionUpdateinput.metadata as MetadataInput[]}
				bind:privateMetadata={collectionUpdateinput.privateMetadata as MetadataInput[]}
				bind:media
				bind:ok={generalFormOk}
			/>
			<ProductListForm collectionID={page.params.id} />
			<SeoForm
				bind:slug={collectionUpdateinput.slug as string}
				bind:seo={collectionUpdateinput.seo as SeoInput}
				bind:ok={seoFormOk}
				name={collectionUpdateinput.name as string}
			/>
		</div>

		<div class="w-3/10">
			<AvailabilityForm
				bind:addChannelListings={collectionChannelListingUpdateInput.addChannels!}
				bind:removeChannels={collectionChannelListingUpdateInput.removeChannels!}
			/>
		</div>
	</div>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()}
		{onDeleteClick}
		{onUpdateClick}
	/>
{/if}
