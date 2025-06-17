<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { CATEGORY_DETAIL_QUERY } from '$lib/api';
	import { CATEGORY_DELETE_MUTATION } from '$lib/api/admin/category';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/config/categories/detail-skeleton.svelte';
	import GeneralInformation from '$lib/components/pages/settings/config/categories/general-information.svelte';
	import SubSection from '$lib/components/pages/settings/config/categories/sub-section.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import type {
		CategoryInput,
		Mutation,
		MutationCategoryDeleteArgs,
		Query,
		QueryCategoryArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const categoryQuery = operationStore<Pick<Query, 'category'>, QueryCategoryArgs>({
		kind: 'query',
		query: CATEGORY_DETAIL_QUERY,
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
	});

	let categoryInput = $state<CategoryInput>({
		name: '',
		description: {},
		slug: '',
		seo: {
			title: '',
			description: '',
		},
	});
	let performUpdateMetadata = $state(false);
	let loading = $state(false);

	onMount(() =>
		categoryQuery.subscribe((result) => {
			if (result.data?.category) {
				const { name, description, backgroundImage, slug, seoDescription, seoTitle } =
					result.data.category;

				categoryInput = {
					name,
					description: description ? JSON.parse(description) : {},
					slug,
					seo: {
						title: seoTitle,
						description: seoDescription,
					},
				};
			}
		}),
	);

	const handleDeleteClick = () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: `Are you sure you want to delete the category ${page.params.id}`,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'categoryDelete'>,
					MutationCategoryDeleteArgs
				>(CATEGORY_DELETE_MUTATION, { id: page.params.id });
				loading = false;

				if (checkIfGraphqlResultHasError(result, 'categoryDelete', 'Successfully deleted cateory'))
					return;

				await goto(AppRoute.SETTINGS_CONFIGS_CATEGORIES());
			},
		});
	};

	const handleUpdate = async () => {};
</script>

{#if $categoryQuery.fetching}
	<DetailSkeleton />
{:else if $categoryQuery.error}
	<Alert size="sm" bordered variant="error">{$categoryQuery.error.message}</Alert>
{:else if $categoryQuery.data?.category}
	{@const { category } = $categoryQuery.data}
	<div class="flex flex-row gap-2">
		<div class="w-6/10 space-y-2">
			<GeneralInformation
				bind:name={categoryInput.name!}
				bind:description={categoryInput.description}
				bind:slug={categoryInput.slug!}
				bind:seoTitle={categoryInput.seo!.title!}
				bind:seoDescription={categoryInput.seo!.description!}
				{loading}
			/>

			<GeneralMetadataEditor
				metadata={category.metadata}
				privateMetadata={category.privateMetadata}
				objectId={category.id}
				{performUpdateMetadata}
				disabled={loading}
			/>
		</div>

		<div class="w-4/10">
			<SubSection categoryId={category.id} />
		</div>
	</div>

	<ActionBar
		onUpdateClick={handleUpdate}
		onDeleteClick={handleDeleteClick}
		disabled={loading}
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_CATEGORIES()}
	/>
{/if}
