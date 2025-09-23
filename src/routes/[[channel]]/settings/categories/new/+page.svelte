<script lang="ts">
	import { goto } from '$app/navigation';
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
	import { toast } from 'svelte-sonner';

	let media = $state<MediaObject[]>([]);
	let generalFormOk = $state(false);
	let createdCategoryId = $state<string>('');
	let loading = $state(false);
	let metaRef = $state<GeneralMetadataEditorRef>();

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
		});

		if (checkIfGraphqlResultHasError(result, 'categoryCreate')) {
			loading = false;
			return;
		}

		const hasErr = await metaRef?.handleUpdate(result.data?.categoryCreate?.category?.id!);
		loading = false;

		if (!hasErr) toast.success($CommonState.CreateSuccess);
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

	<GeneralMetadataEditor
		objectId={createdCategoryId}
		disabled={loading}
		bind:this={metaRef}
		onDoneUpdate={() => goto(AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(createdCategoryId))}
	/>
</div>

<ActionBar
	onAddClick={handleCreate}
	disabled={loading}
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_CATEGORIES()}
	disableCreateButton={loading || !generalFormOk}
/>
