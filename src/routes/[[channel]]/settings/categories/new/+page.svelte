<script lang="ts">
	import { goto } from '$app/navigation';
	import { CATEGORY_CREATE_MUTATION } from '$lib/api/admin/category';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import GeneralInformation from '$lib/components/pages/settings/categories/general-information.svelte';
	import type { CategoryInput, Mutation, MutationCategoryCreateArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import type { MediaObject } from '$lib/utils/types';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { tranFunc } from '$i18n';

	let media = $state<MediaObject[]>([]);
	let generalFormOk = $state(false);
	let performUpdateMetadata = $state(false);
	let createdCategoryId = $state<string>('');

	let categoryInput = $state<CategoryInput>({
		name: '',
		description: { blocks: [] },
		slug: '',
		seo: {
			title: '',
			description: '',
		},
	});
	let loading = $state(false);

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

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'categoryCreate', $tranFunc('common.createSuccess')))
			return;

		createdCategoryId = result.data?.categoryCreate?.category?.id!;

		if (createdCategoryId) {
			performUpdateMetadata = true;
		}
	};
</script>

<div class="flex flex-row gap-2">
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
			bind:performUpdateMetadata
			onDoneUpdate={() => goto(AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(createdCategoryId))}
		/>
	</div>
</div>

<ActionBar
	onAddClick={handleCreate}
	disabled={loading}
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_CATEGORIES()}
	disableCreateButton={loading || !generalFormOk}
/>
