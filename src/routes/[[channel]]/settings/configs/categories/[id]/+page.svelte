<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { CATEGORY_DETAIL_QUERY } from '$lib/api';
	import { CATEGORY_DELETE_MUTATION, CATEGORY_UPDATE_MUTATION } from '$lib/api/admin/category';
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
	import type { MediaObject } from '$lib/utils/types';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	let media = $state<MediaObject[]>([]);
	let generalFormOk = $state(false);

	const categoryQuery = operationStore<Pick<Query, 'category'>, QueryCategoryArgs>({
		kind: 'query',
		query: CATEGORY_DETAIL_QUERY,
		variables: {
			id: page.params.id,
		},
		requestPolicy: 'cache-and-network',
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

	afterNavigate(() => {
		categoryQuery.reexecute({
			variables: {
				id: page.params.id,
			},
			context: { requestPolicy: 'network-only' },
		});
	});

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

				if (backgroundImage) {
					media = [
						{
							alt: backgroundImage.alt || name,
							url: backgroundImage.url,
							type: 'image',
						},
					];
				}
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

				if (checkIfGraphqlResultHasError(result, 'categoryDelete', 'Successfully deleted category'))
					return;

				await goto(AppRoute.SETTINGS_CONFIGS_CATEGORIES());
			},
		});
	};

	const handleUpdate = async () => {
		if (!generalFormOk) return;
		loading = true;

		performUpdateMetadata = true;

		const result = await GRAPHQL_CLIENT.mutation(CATEGORY_UPDATE_MUTATION, {
			id: page.params.id,
			input: {
				...categoryInput,
				description: JSON.stringify(categoryInput.description),
				backgroundImage: media[0]?.file,
				backgroundImageAlt: media[0]?.alt,
			},
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'categoryUpdate', 'Category updated successfully'))
			return;

		categoryQuery.reexecute({
			variables: { id: page.params.id },
			context: { requestPolicy: 'network-only' },
		});
	};
</script>

{#if $categoryQuery.fetching}
	<DetailSkeleton />
{:else if $categoryQuery.error}
	<Alert size="sm" bordered variant="error">{$categoryQuery.error.message}</Alert>
{:else if $categoryQuery.data?.category}
	{@const { metadata, privateMetadata, id } = $categoryQuery.data.category}
	<div class="flex flex-row gap-2">
		<div class="w-6/10 space-y-2">
			<GeneralInformation
				bind:name={categoryInput.name!}
				bind:description={categoryInput.description}
				bind:slug={categoryInput.slug!}
				bind:seoTitle={categoryInput.seo!.title!}
				bind:media
				bind:seoDescription={categoryInput.seo!.description!}
				bind:ok={generalFormOk}
				{loading}
			/>

			<GeneralMetadataEditor
				{metadata}
				{privateMetadata}
				objectId={id}
				bind:performUpdateMetadata
				disabled={loading}
			/>
		</div>

		<div class="w-4/10">
			<SubSection categoryId={id} />
		</div>
	</div>

	<ActionBar
		onUpdateClick={handleUpdate}
		onDeleteClick={handleDeleteClick}
		disabled={loading}
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_CATEGORIES()}
		disableUpdateButton={loading || !generalFormOk}
	/>
{/if}
