<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { CATEGORY_CREATE_MUTATION } from '$lib/api/admin/category';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import GeneralInformation from '$lib/components/pages/settings/categories/general-information.svelte';
	import type { GeneralMetadataEditorRef } from '$lib/components/pages/settings/common';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import type { CategoryInput, Mutation, MutationCategoryCreateArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import toast from 'svelte-french-toast';

	let media = $state<MediaObject[]>([]);
	let generalFormOk = $state(false);
	let metadataOk = $state(true);
	let loading = $state(false);
	let metaRef = $state<GeneralMetadataEditorRef>();

	/** categories are organized as tree, so when we want to create a child category of a parent, we need to provide query param 'parant' for it */
	const ParentId = $derived(page.url.searchParams.get('parent') || undefined);

	let categoryInput = $state<CategoryInput>({
		name: '',
		description: { blocks: [] },
		slug: '',
		seo: {
			title: '',
			description: '',
		},
	});

	const handleCreate = async () => {
		if (!generalFormOk) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'categoryCreate'>,
			MutationCategoryCreateArgs
		>(CATEGORY_CREATE_MUTATION, {
			input: {
				...categoryInput,
				description: JSON.stringify(categoryInput.description),
				backgroundImage: media[0]?.file,
				backgroundImageAlt: media[0]?.alt,
			},
			parent: ParentId
		});

		if (checkIfGraphqlResultHasError(result, 'categoryCreate')) {
			loading = false;
			return;
		}

		const hasErr = await metaRef?.handleUpdate(result.data?.categoryCreate?.category?.id!);
		loading = false;

		if (hasErr) return;

		toast.success($CommonState.CreateSuccess);
		await goto(
			AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(result.data?.categoryCreate?.category?.id!),
		);
	};
</script>

<div class="w-full space-y-2">
	<GeneralInformation
		bind:name={categoryInput.name!}
		bind:description={categoryInput.description}
		bind:slug={categoryInput.slug!}
		bind:seoTitle={categoryInput.seo!.title!}
		bind:media
		bind:seoDescription={categoryInput.seo!.description!}
		bind:ok={generalFormOk}
		{loading}
		isCreatePage
	/>

	<GeneralMetadataEditor disabled={loading} bind:this={metaRef} bind:formOk={metadataOk} />
</div>

<ActionBar
	onAddClick={handleCreate}
	disabled={loading}
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_CATEGORIES()}
	disableCreateButton={loading || !generalFormOk || !metadataOk}
/>
