<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		COLLECTION_CHANNEL_LISTING_UPDATE_MUTATION,
		COLLECTION_DETAIL_QUERY,
		COLLECTION_UPDATE_MUTATION
	} from '$lib/api/admin/collections';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { COLLECTION_DELETE_MUTATION } from '$lib/api/collections';
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
		Mutation,
		MutationCollectionChannelListingUpdateArgs,
		MutationCollectionDeleteArgs,
		MutationCollectionUpdateArgs,
		Query,
		QueryCollectionArgs,
		SeoInput
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { omit } from 'es-toolkit';

	let collectionUpdateInput = $state<CollectionInput>({
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
	let loading = $state(false);

	const collectionDetail = operationStore<Pick<Query, 'collection'>, QueryCollectionArgs>({
		kind: 'query',
		query: COLLECTION_DETAIL_QUERY,
		variables: {
			id: page.params.id
		},
		pause: !page.params.id
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
			collectionUpdateInput = {
				name,
				slug,
				description: description ? JSON.parse(description) : undefined,
				seo: {
					title: seoTitle,
					description: seoDescription
				},
				metadata: metadata.map((item) => omit(item, ['__typename'])),
				privateMetadata: privateMetadata.map((item) => omit(item, ['__typename']))
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

	const onDeleteClick = () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: 'Are you sure deleting this collection?',
			onOk: async () => {
				loading = true; //

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'collectionDelete'>,
					MutationCollectionDeleteArgs
				>(COLLECTION_DELETE_MUTATION, {
					id: page.params.id
				});

				loading = false; //

				if (
					preHandleErrorOnGraphqlResult(
						result,
						'collectionDelete',
						'Collection deleted successfully!'
					)
				)
					return;

				await goto(AppRoute.SETTINGS_CONFIGS_COLLECTIONS());
			}
		});
	};

	const onUpdateClick = async () => {
		let hasError = false;

		loading = true; //

		// 1) update general information of collection:
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionUpdate'>,
			MutationCollectionUpdateArgs
		>(COLLECTION_UPDATE_MUTATION, {
			id: page.params.id,
			input: {
				...collectionUpdateInput,
				description: JSON.stringify(collectionUpdateInput.description) || null
			}
		});

		hasError ||= preHandleErrorOnGraphqlResult(
			result,
			'collectionUpdate',
			'Collection updated successfully'
		);

		// 2) update channel listings
		const result2 = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionChannelListingUpdate'>,
			MutationCollectionChannelListingUpdateArgs
		>(COLLECTION_CHANNEL_LISTING_UPDATE_MUTATION, {
			id: page.params.id,
			input: collectionChannelListingUpdateInput
		});

		loading = false; //

		hasError ||= preHandleErrorOnGraphqlResult(
			result2,
			'collectionChannelListingUpdate',
			'Collection channel listing updated successfully'
		);

		if (hasError) return;

		collectionDetail.reexecute({
			variables: {
				id: page.params.id
			}
		});
	};
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
				bind:name={collectionUpdateInput.name as string}
				bind:description={collectionUpdateInput.description}
				bind:metadata={collectionUpdateInput.metadata as MetadataInput[]}
				bind:privateMetadata={collectionUpdateInput.privateMetadata as MetadataInput[]}
				bind:media
				bind:ok={generalFormOk}
				disabled={loading}
			/>
			<ProductListForm collectionID={page.params.id} disabled={loading} />
			<SeoForm
				bind:slug={collectionUpdateInput.slug as string}
				bind:seo={collectionUpdateInput.seo as SeoInput}
				bind:ok={seoFormOk}
				name={collectionUpdateInput.name as string}
				disabled={loading}
			/>
		</div>

		<div class="w-3/10">
			<AvailabilityForm
				bind:addChannelListings={collectionChannelListingUpdateInput.addChannels!}
				bind:removeChannels={collectionChannelListingUpdateInput.removeChannels!}
				disabled={loading}
			/>
		</div>
	</div>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()}
		{onDeleteClick}
		{onUpdateClick}
		disabled={loading}
	/>
{/if}
