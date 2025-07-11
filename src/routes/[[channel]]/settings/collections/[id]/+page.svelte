<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		COLLECTION_CHANNEL_LISTING_UPDATE_MUTATION,
		COLLECTION_DETAIL_QUERY,
		COLLECTION_UPDATE_MUTATION,
	} from '$lib/api/admin/collections';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { COLLECTION_DELETE_MUTATION } from '$lib/api/collections';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import AvailabilityForm from '$lib/components/pages/settings/collections/availability-form.svelte';
	import CollectionDetailSkeleton from '$lib/components/pages/settings/collections/collection-detail-skeleton.svelte';
	import GeneralInformationForm from '$lib/components/pages/settings/collections/general-information-form.svelte';
	import ProductListForm from '$lib/components/pages/settings/collections/product-list-form.svelte';
	import SeoForm from '$lib/components/pages/settings/collections/seo-form.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import type {
		CollectionChannelListingUpdateInput,
		CollectionInput,
		Mutation,
		MutationCollectionChannelListingUpdateArgs,
		MutationCollectionDeleteArgs,
		MutationCollectionUpdateArgs,
		Query,
		QueryCollectionArgs,
		SeoInput,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import type { MediaObject } from '$lib/utils/types';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { tranFunc } from '$i18n';

	let collectionUpdateInput = $state<CollectionInput>({
		name: '',
		description: '',
		slug: '',
		seo: {
			title: '',
			description: '',
		},
		metadata: [],
		privateMetadata: [],
	});
	let media = $state<MediaObject[]>([]);
	let generalFormOk = $state(false);
	let seoFormOk = $state(false);
	let collectionChannelListingUpdateInput = $state<CollectionChannelListingUpdateInput>({
		addChannels: [],
		removeChannels: [],
	});
	let loading = $state(false);
	let performUpdateMetadata = $state(false); // trigger update metadata

	const collectionDetailQuery = operationStore<Pick<Query, 'collection'>, QueryCollectionArgs>({
		kind: 'query',
		query: COLLECTION_DETAIL_QUERY,
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
		requestPolicy: 'network-only',
	});

	onMount(() =>
		collectionDetailQuery.subscribe((result) => {
			if (result.data?.collection) {
				const {
					name,
					slug,
					description,
					backgroundImage,
					seoTitle,
					seoDescription,
					channelListings,
				} = result.data.collection;
				collectionUpdateInput = {
					name,
					slug,
					description: description ? JSON.parse(description) : undefined,
					seo: {
						title: seoTitle,
						description: seoDescription,
					},
				};
				if (backgroundImage)
					media = [
						{
							alt: backgroundImage.alt || '',
							url: backgroundImage.url,
							type: 'image',
						},
					];

				if (channelListings?.length) {
					collectionChannelListingUpdateInput.addChannels = channelListings.map((item) => ({
						channelId: item.channel.id,
						isPublished: item.isPublished,
						publishedAt: item.publishedAt,
					}));
				}
			}
		}),
	);

	const onDeleteClick = () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('common.confirmDel'),
			onOk: async () => {
				loading = true; //

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'collectionDelete'>,
					MutationCollectionDeleteArgs
				>(COLLECTION_DELETE_MUTATION, {
					id: page.params.id,
				});

				loading = false; //

				if (
					checkIfGraphqlResultHasError(result, 'collectionDelete', $tranFunc('common.delSuccess'))
				)
					return;

				await goto(AppRoute.SETTINGS_CONFIGS_COLLECTIONS());
			},
		});
	};

	const onUpdateClick = async () => {
		let hasError = false;

		loading = true; //
		performUpdateMetadata = true; // trigger update metadata

		const input = {
			...collectionUpdateInput,
			description: JSON.stringify(collectionUpdateInput.description),
		};
		if (media[0].file) input.backgroundImage = media[0].file;
		input.backgroundImageAlt = media[0].alt;

		// 1) update general information of collection:
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionUpdate'>,
			MutationCollectionUpdateArgs
		>(COLLECTION_UPDATE_MUTATION, {
			id: page.params.id,
			input,
		});

		hasError ||= checkIfGraphqlResultHasError(result, 'collectionUpdate');

		// 2) update channel listings
		const result2 = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionChannelListingUpdate'>,
			MutationCollectionChannelListingUpdateArgs
		>(COLLECTION_CHANNEL_LISTING_UPDATE_MUTATION, {
			id: page.params.id,
			input: collectionChannelListingUpdateInput,
		});

		loading = false; //

		hasError ||= checkIfGraphqlResultHasError(
			result2,
			'collectionChannelListingUpdate',
			$tranFunc('common.editSuccess'),
		);

		if (hasError) return;

		collectionDetailQuery.reexecute({
			variables: {
				id: page.params.id,
			},
		});
	};
</script>

{#if $collectionDetailQuery.fetching}
	<CollectionDetailSkeleton />
{:else if $collectionDetailQuery.error}
	<Alert variant="error" size="sm" bordered>
		{$collectionDetailQuery.error.message}
	</Alert>
{:else if $collectionDetailQuery.data?.collection}
	{@const { metadata, privateMetadata, id } = $collectionDetailQuery.data.collection}
	<div class="flex gap-2 flex-row">
		<div class="w-7/10 flex flex-col gap-2">
			<GeneralInformationForm
				bind:name={collectionUpdateInput.name!}
				bind:description={collectionUpdateInput.description}
				bind:media
				bind:ok={generalFormOk}
				disabled={loading}
			/>
			<GeneralMetadataEditor
				{metadata}
				{privateMetadata}
				disabled={loading}
				objectId={id}
				bind:performUpdateMetadata
			/>
			<ProductListForm collectionID={page.params.id} disabled={loading} />
			<SeoForm
				bind:slug={collectionUpdateInput.slug!}
				bind:seo={collectionUpdateInput.seo!}
				bind:ok={seoFormOk}
				name={collectionUpdateInput.name!}
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
