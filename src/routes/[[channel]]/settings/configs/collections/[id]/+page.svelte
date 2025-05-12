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
		backgroundImage: null,
		seo: {
			title: '',
			description: ''
		},
		metadata: [],
		privateMetadata: [],
		backgroundImageAlt: ''
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
				privateMetadata
			} = $collectionDetail.data.collection;
			collectionUpdateinput = {
				name,
				slug,
				description: description ? JSON.parse(description) : undefined,
				backgroundImage,
				seo: {
					title: seoTitle,
					description: seoDescription
				},
				metadata,
				privateMetadata,
				backgroundImageAlt: backgroundImage?.alt
			};
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
				isCreatePage={false}
				bind:name={collectionUpdateinput.name as string}
				bind:description={collectionUpdateinput.description as string}
				bind:media={collectionUpdateinput.backgroundImage as MediaObject | null}
				bind:metadata={collectionUpdateinput.metadata as MetadataInput[]}
				bind:privateMetadata={collectionUpdateinput.privateMetadata as MetadataInput[]}
				bind:backgroundImageAlt={collectionUpdateinput.backgroundImageAlt as string}
			/>
			<ProductListForm collectionID={page.params.id} />
			<SeoForm
				bind:slug={collectionUpdateinput.slug as string}
				bind:seo={collectionUpdateinput.seo as SeoInput}
				name={collectionUpdateinput.name as string}
				isCreatePage={false}
			/>
		</div>

		<div class="w-3/10">
			<AvailabilityForm />
		</div>
	</div>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()}
		{onDeleteClick}
		{onUpdateClick}
	/>
{/if}