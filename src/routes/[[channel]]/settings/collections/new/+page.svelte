<script lang="ts">
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import AvailabilityForm from '$lib/components/pages/settings/collections/availability-form.svelte';
	import GeneralInformationForm from '$lib/components/pages/settings/collections/general-information-form.svelte';
	import SeoForm from '$lib/components/pages/settings/collections/seo-form.svelte';
	import {
		type CollectionCreateInput,
		type Mutation,
		type MutationCollectionChannelListingUpdateArgs,
		type MutationCollectionCreateArgs,
		type PublishableChannelListingInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import ProductAssignForm from '$lib/components/pages/settings/collections/product-assign-form.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import {
		COLLECTION_CHANNEL_LISTING_UPDATE_MUTATION,
		COLLECTION_CREATE_MUTATION,
	} from '$lib/api/admin/collections';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { goto } from '$app/navigation';
	import { CommonState } from '$lib/utils/common.svelte';
	import { toast } from 'svelte-sonner';

	let generalFormOk = $state(false);
	let seoFormOk = $state(false);
	let createdCollectionId = $state<string>('');
	let loading = $state(false);
	let channelListingsInput = $state<PublishableChannelListingInput[]>([]);
	let metaEditorRef = $state<any>();

	let collectionCreateInput = $state<CollectionCreateInput>({
		name: '',
		description: { blocks: [] },
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
			input: {
				...collectionCreateInput,
				backgroundImage: media[0].file,
				backgroundImageAlt: media[0].alt,
				description: collectionCreateInput.description
					? JSON.stringify(collectionCreateInput.description)
					: '',
			},
		});

		if (checkIfGraphqlResultHasError(result, 'collectionCreate')) {
			loading = false;
			return;
		}

		// create success, add metadata now
		createdCollectionId = result.data?.collectionCreate?.collection?.id as string;

		const hasErr = await metaEditorRef.handleUpdate();
		if (hasErr) {
			loading = false;
			return;
		}

		// create channel listings:
		const channelListingResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionChannelListingUpdate'>,
			MutationCollectionChannelListingUpdateArgs
		>(COLLECTION_CHANNEL_LISTING_UPDATE_MUTATION, {
			id: createdCollectionId,
			input: {
				addChannels: channelListingsInput,
			},
		});
		loading = false;

		if (checkIfGraphqlResultHasError(channelListingResult, 'collectionChannelListingUpdate'))
			return;

		toast.success(CommonState.CreateSuccess);
		await goto(AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(createdCollectionId));
	};
</script>

<div class="flex gap-2 flex-row tablet:flex-col">
	<div class="w-6/10 space-y-2 tablet:w-full">
		<GeneralInformationForm
			bind:name={collectionCreateInput.name!}
			bind:description={collectionCreateInput.description}
			bind:media
			bind:ok={generalFormOk}
			disabled={loading}
		/>
		<ProductAssignForm bind:productsToAssign={collectionCreateInput.products!} disabled={loading} />
		<SeoForm
			bind:slug={collectionCreateInput.slug!}
			bind:seo={collectionCreateInput.seo!}
			name={collectionCreateInput.name!}
			isCreatePage
			bind:ok={seoFormOk}
			disabled={loading}
		/>
		<GeneralMetadataEditor
			bind:this={metaEditorRef}
			metadata={[]}
			privateMetadata={[]}
			objectId={createdCollectionId}
			disabled={loading}
		/>
	</div>

	<AvailabilityForm disabled={loading} bind:addChannelListings={channelListingsInput} />
</div>

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()}
	disableBackButton={loading}
	{onAddClick}
	disableCreateButton={!generalFormOk || !seoFormOk || loading}
/>
