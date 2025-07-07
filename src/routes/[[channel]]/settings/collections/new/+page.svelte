<script lang="ts">
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import AvailabilityForm from '$lib/components/pages/settings/config/collections/availability-form.svelte';
	import GeneralInformationForm from '$lib/components/pages/settings/config/collections/general-information-form.svelte';
	import SeoForm from '$lib/components/pages/settings/config/collections/seo-form.svelte';
	import {
		type CollectionCreateInput,
		type Mutation,
		type MutationCollectionCreateArgs,
		type SeoInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import ProductAssignForm from '$lib/components/pages/settings/config/collections/product-assign-form.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { COLLECTION_CREATE_MUTATION } from '$lib/api/admin/collections';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	let generalFormOk = $state(false);
	let seoFormOk = $state(false);
	let createdCollectionId = $state<string>('');
	let performUpdateMetadata = $state(false);
	let loading = $state(false);

	let collectionCreateInput = $state<CollectionCreateInput>({
		name: '',
		description: '',
		backgroundImage: '',
		backgroundImageAlt: '',
		products: [],
		slug: '',
		seo: {
			title: '',
			description: '',
		},
	});
	let media = $state<MediaObject[]>([]);

	const onAddClick = async () => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionCreate'>,
			MutationCollectionCreateArgs
		>(COLLECTION_CREATE_MUTATION, {
			input: collectionCreateInput,
		});

		if (checkIfGraphqlResultHasError(result, 'collectionCreate')) {
			loading = false;
			return;
		}

		// create success, add metadata now
		createdCollectionId = result.data?.collectionCreate?.collection?.id as string;
		if (createdCollectionId) {
			performUpdateMetadata = true;
		}
		loading = false;
	};
</script>

<div class="flex gap-2 flex-row">
	<div class="w-7/10 flex flex-col gap-2">
		<GeneralInformationForm
			bind:name={collectionCreateInput.name as string}
			bind:description={collectionCreateInput.description}
			bind:media
			bind:ok={generalFormOk}
		/>
		<ProductAssignForm bind:productsToAssign={collectionCreateInput.products!} />
		<SeoForm
			bind:slug={collectionCreateInput.slug as string}
			bind:seo={collectionCreateInput.seo as SeoInput}
			name={collectionCreateInput.name as string}
			isCreatePage
			bind:ok={seoFormOk}
		/>
		<GeneralMetadataEditor
			metadata={[]}
			privateMetadata={[]}
			objectId={createdCollectionId}
			bind:performUpdateMetadata
		/>
	</div>

	<div class="w-3/10">
		<AvailabilityForm />
	</div>
</div>

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()}
	{onAddClick}
	disableCreateButton={!generalFormOk || !seoFormOk}
	disabled={loading || !generalFormOk || !seoFormOk}
/>
