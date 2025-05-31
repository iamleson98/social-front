<script lang="ts">
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import AvailabilityForm from '$lib/components/pages/settings/config/collections/availability-form.svelte';
	import GeneralInformationForm from '$lib/components/pages/settings/config/collections/general-information-form.svelte';
	import SeoForm from '$lib/components/pages/settings/config/collections/seo-form.svelte';
	import { type CollectionCreateInput, type SeoInput } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import ProductAssignForm from '$lib/components/pages/settings/config/collections/product-assign-form.svelte';
	import type { MediaObject } from '$lib/utils/types';

	const onAddClick = () => {};

	let generalFormOk = $state(false);
	let seoFormOk = $state(false);
	let createdCollectionId = $state<string>('');
	let performUpdateMetadata = $state(false);
	let loading = $state(false);

	let collectionCreateinput = $state<CollectionCreateInput>({
		name: '',
		description: '',
		backgroundImage: '',
		metadata: [],
		privateMetadata: [],
		backgroundImageAlt: '',
		slug: '',
		seo: {
			title: '',
			description: '',
		},
	});
	let media = $state<MediaObject>();
</script>

<div class="flex gap-2 flex-row">
	<div class="w-7/10 flex flex-col gap-2">
		<GeneralInformationForm
			bind:name={collectionCreateinput.name as string}
			bind:description={collectionCreateinput.description}
			bind:media
			bind:ok={generalFormOk}
		/>
		<ProductAssignForm />
		<SeoForm
			bind:slug={collectionCreateinput.slug as string}
			seo={collectionCreateinput.seo as SeoInput}
			name={collectionCreateinput.name as string}
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

<ActionBar backButtonUrl={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()} {onAddClick} />
