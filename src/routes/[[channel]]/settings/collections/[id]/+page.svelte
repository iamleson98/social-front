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
	import AvailabilityForm from '$lib/components/pages/settings/collections/availability-form.svelte';
	import CollectionDetailSkeleton from '$lib/components/pages/settings/collections/collection-detail-skeleton.svelte';
	import GeneralInformationForm from '$lib/components/pages/settings/collections/general-information-form.svelte';
	import ProductListForm from '$lib/components/pages/settings/collections/product-list-form.svelte';
	import SeoForm from '$lib/components/pages/settings/collections/seo-form.svelte';
	import type { GeneralMetadataEditorRef } from '$lib/components/pages/settings/common';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		ProductMediaType,
		type CollectionChannelListingUpdateInput,
		type CollectionInput,
		type Mutation,
		type MutationCollectionChannelListingUpdateArgs,
		type MutationCollectionDeleteArgs,
		type MutationCollectionUpdateArgs,
		type Query,
		type QueryCollectionArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';

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
	let generalFormOk = $state(true);
	let seoFormOk = $state(true);
	let metaFormOk = $state(true);
	let collectionChannelListingUpdateInput = $state<CollectionChannelListingUpdateInput>({
		addChannels: [],
		removeChannels: [],
	});
	let loading = $state(false);
	let metaRef = $state<GeneralMetadataEditorRef>();
	const ShouldEnableActionBar = $derived(
		generalFormOk && seoFormOk && metaFormOk && !loading,
	);

	const collectionDetailQuery = operationStore<Pick<Query, 'collection'>, QueryCollectionArgs>({
		query: COLLECTION_DETAIL_QUERY,
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
		requestPolicy: 'cache-and-network',
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
							type: ProductMediaType.Image,
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
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true; //

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'collectionDelete'>,
					MutationCollectionDeleteArgs
				>(COLLECTION_DELETE_MUTATION, {
					id: page.params.id!,
				});

				loading = false; //

				if (checkIfGraphqlResultHasError(result, 'collectionDelete', $CommonState.DeleteSuccess))
					return;

				await goto(AppRoute.SETTINGS_CONFIGS_COLLECTIONS());
			},
		});
	};

	const onUpdateClick = async () => {
		const input = {
			...collectionUpdateInput,
			description: JSON.stringify(collectionUpdateInput.description),
		};
		if (media[0]?.file) input.backgroundImage = media[0].file;
		input.backgroundImageAlt = media[0]?.alt;

		const generalUpdateJob = GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionUpdate'>,
			MutationCollectionUpdateArgs
		>(COLLECTION_UPDATE_MUTATION, {
			id: page.params.id!,
			input,
		});

		const channelListingUpdateJob = GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionChannelListingUpdate'>,
			MutationCollectionChannelListingUpdateArgs
		>(COLLECTION_CHANNEL_LISTING_UPDATE_MUTATION, {
			id: page.params.id!,
			input: collectionChannelListingUpdateInput,
		});

		loading = true;
		const results = await Promise.all([generalUpdateJob, channelListingUpdateJob]);

		const keys = ['collectionUpdate', 'collectionChannelListingUpdate'] as const;
		if (results.some((result, idx) => checkIfGraphqlResultHasError(result as any, keys[idx]))) {
			loading = false;
			return;
		}

		const hasErr = await metaRef?.handleUpdate();
		loading = false;
		if (hasErr) return;

		toast.success($CommonState.EditSuccess);
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
	<div class="flex gap-2 flex-row tablet:flex-col">
		<div class={['w-7/10 tablet:w-full space-y-2']}>
			<GeneralInformationForm
				bind:name={collectionUpdateInput.name!}
				bind:description={collectionUpdateInput.description}
				bind:media
				bind:ok={generalFormOk}
				disabled={loading}
			/>
			<ProductListForm collectionID={page.params.id} disabled={loading} />
			<SeoForm
				bind:slug={collectionUpdateInput.slug!}
				bind:seo={collectionUpdateInput.seo!}
				bind:ok={seoFormOk}
				name={collectionUpdateInput.name!}
				disabled={loading}
			/>
			<GeneralMetadataEditor
				{metadata}
				{privateMetadata}
				disabled={loading}
				objectId={id}
				bind:this={metaRef}
				bind:formOk={metaFormOk}
			/>
		</div>

		<AvailabilityForm
			bind:addChannelListings={collectionChannelListingUpdateInput.addChannels!}
			bind:removeChannels={collectionChannelListingUpdateInput.removeChannels!}
			disabled={loading}
		/>
	</div>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()}
		{onDeleteClick}
		{onUpdateClick}
		disabled={!ShouldEnableActionBar}
	/>
{/if}
