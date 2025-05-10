<script lang="ts">
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import AvailabilityForm from '$lib/components/pages/settings/config/collections/availability-form.svelte';
	import GeneralInformationForm from '$lib/components/pages/settings/config/collections/general-information-form.svelte';
	import ProductListForm from '$lib/components/pages/settings/config/collections/product-list-form.svelte';
	import SeoForm from '$lib/components/pages/settings/config/collections/seo-form.svelte';
	import { type CollectionCreateInput, type MetadataInput, type SeoInput } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { type MediaObject } from '$lib/components/pages/settings/products/new/utils';

	const onDeleteClick = () => {};

	const onAddClick = () => {};

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
			description: ''
		}
	});
</script>

<div class="flex gap-2 flex-row">
	<div class="w-7/10 flex flex-col gap-2">
		<GeneralInformationForm
			bind:name={collectionCreateinput.name as string}
			bind:description={collectionCreateinput.description as string}
			bind:backgroundImage={collectionCreateinput.backgroundImage}
			bind:metadata={collectionCreateinput.metadata as MetadataInput[]}
			bind:privateMetadata={collectionCreateinput.privateMetadata as MetadataInput[]}
			bind:backgroundImageAlt={collectionCreateinput.backgroundImageAlt as string}
			isCreatePage
		/>
		<ProductListForm />
		<SeoForm
			bind:slug={collectionCreateinput.slug as string}
			seo={collectionCreateinput.seo as SeoInput}
			name={collectionCreateinput.name as string}
		/>
	</div>

	<div class="w-3/10">
		<AvailabilityForm />
	</div>
</div>

<ActionBar backButtonUrl={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()} {onAddClick} />
