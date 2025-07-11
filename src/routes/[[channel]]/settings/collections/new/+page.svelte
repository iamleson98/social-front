<script lang="ts">
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import AvailabilityForm from '$lib/components/pages/settings/collections/availability-form.svelte';
	import GeneralInformationForm from '$lib/components/pages/settings/collections/general-information-form.svelte';
	import SeoForm from '$lib/components/pages/settings/collections/seo-form.svelte';
	import {
		type CollectionCreateInput,
		type Mutation,
		type MutationCollectionCreateArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import ProductAssignForm from '$lib/components/pages/settings/collections/product-assign-form.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { COLLECTION_CREATE_MUTATION } from '$lib/api/admin/collections';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { tranFunc } from '$i18n';

	let generalFormOk = $state(false);
	let seoFormOk = $state(false);
	let createdCollectionId = $state<string>('');
	let performUpdateMetadata = $state(false);
	let loading = $state(false);

	let collectionCreateInput = $state<CollectionCreateInput>({
		name: '',
		description: {},
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

		if (
			checkIfGraphqlResultHasError(result, 'collectionCreate', $tranFunc('common.createSuccess'))
		) {
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
	<div class="w-7/10 space-y-2">
		<GeneralInformationForm
			bind:name={collectionCreateInput.name!}
			bind:description={collectionCreateInput.description}
			bind:media
			bind:ok={generalFormOk}
			disabled={loading}
		/>
		<ProductAssignForm bind:productsToAssign={collectionCreateInput.products!} />
		<SeoForm
			bind:slug={collectionCreateInput.slug!}
			bind:seo={collectionCreateInput.seo!}
			name={collectionCreateInput.name!}
			isCreatePage
			bind:ok={seoFormOk}
			disabled={loading}
		/>
		<GeneralMetadataEditor
			metadata={[]}
			privateMetadata={[]}
			objectId={createdCollectionId}
			bind:performUpdateMetadata
			disabled={loading}
		/>
	</div>

	<div class="w-3/10">
		<AvailabilityForm />
	</div>
</div>

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()}
	disableBackButton={loading}
	{onAddClick}
	disableCreateButton={!generalFormOk || !seoFormOk || loading}
/>
