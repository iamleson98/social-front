<script lang="ts">
<<<<<<< HEAD
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
  import type { CollectionInput, Query, QueryCollectionArgs } from '$lib/gql/graphql';
  import { AppRoute } from '$lib/utils';
=======
	import { page } from '$app/state';
	import { COLLECTION_DETAIL_QUERY } from '$lib/api/admin/collections';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import AvailabilityForm from '$lib/components/pages/settings/config/collections/availability-form.svelte';
	import GeneralInformationForm from '$lib/components/pages/settings/config/collections/general-information-form.svelte';
	import ProductListForm from '$lib/components/pages/settings/config/collections/product-list-form.svelte';
	import SeoForm from '$lib/components/pages/settings/config/collections/seo-form.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import {
		type CollectionInput,
		type Query,
		type QueryCollectionArgs
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
>>>>>>> 500f3ab (commit)

  const onDeleteClick = () => {};

  const onUpdateClick = () => {};

  let collectionUpdateinput = $state<CollectionInput>({});

  const collectionDetail = operationStore<Pick<Query, 'collection'>, QueryCollectionArgs>({
    kind: 'query',
    query: COLLECTION_DETAIL_QUERY,
    variables: {
      id: page.params.id
    }
  });

<<<<<<< HEAD
  $effect(() => {
    if ($collectionDetail.data?.collection) {
      const { name, slug, description, backgroundImage, seoTitle, seoDescription, metadata, privateMetadata } = $collectionDetail.data.collection;
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
      }
    }
  });

  function handleNameChange(event: CustomEvent<{ name: string }>) {
    const newName = event.detail.name;
    collectionUpdateinput.name = newName;
    collectionUpdateinput.slug = newName.toLowerCase().replace(/\s+/g, '-');
  }
=======
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
				description,
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
<<<<<<< HEAD
>>>>>>> 500f3ab (commit)
=======
>>>>>>> 500f3abcfe76b4361e9ee6a2b085b58799bc12c8
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
      <GeneralInformationForm on:nameChange={handleNameChange} isCreatePage={false} name={collectionUpdateinput.name as string} description={collectionUpdateinput.description as any} media={collectionUpdateinput.backgroundImage as MediaObject | null} metadata={collectionUpdateinput.metadata as any} privateMetadata={collectionUpdateinput.privateMetadata as any} backgroundImageAlt={collectionUpdateinput.backgroundImageAlt as string} />
      <ProductListForm collectionID={page.params.id} />
      <SeoForm slug={collectionUpdateinput.slug as string} seo={collectionUpdateinput.seo as any}/>
    </div>

<<<<<<< HEAD
    <div class="w-3/10">
      <AvailabilityForm />
    </div>
  </div>
=======
		<div class="w-3/10">
			<AvailabilityForm
				channelListings={$collectionDetail.data.collection?.channelListings || []}
			/>
		</div>
	</div>
>>>>>>> 500f3ab (commit)

  <ActionBar
    backButtonUrl={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()}
    {onDeleteClick}
    {onUpdateClick}
  />
{/if}
