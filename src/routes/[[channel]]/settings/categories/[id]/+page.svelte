<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { CATEGORY_DETAIL_QUERY } from '$lib/api';
	import { CATEGORY_DELETE_MUTATION, CATEGORY_UPDATE_MUTATION } from '$lib/api/admin/category';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/categories/detail-skeleton.svelte';
	import GeneralInformation from '$lib/components/pages/settings/categories/general-information.svelte';
	import SubSection from '$lib/components/pages/settings/categories/sub-section.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		ProductMediaType,
		type CategoryInput,
		type Mutation,
		type MutationCategoryDeleteArgs,
		type Query,
		type QueryCategoryArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import type { MediaObject } from '$lib/utils/types';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { GeneralMetadataEditorRef } from '$lib/components/pages/settings/common';
	import { CommonState } from '$lib/utils/common.svelte';

	let media = $state<MediaObject[]>([]);
	let generalFormOk = $state(false);
	let metaRef = $state<GeneralMetadataEditorRef>();
	let loading = $state(false);

	const categoryQuery = operationStore<
		Pick<Query, 'category'>,
		QueryCategoryArgs & { backgroundSize?: number; isStaffUser?: boolean }
	>({
		query: CATEGORY_DETAIL_QUERY,
		variables: {
			id: page.params.id,
			backgroundSize: 500,
			isStaffUser: true,
		},
		requestPolicy: 'cache-and-network',
		pause: !page.params.id,
	});

	let categoryInput = $state<CategoryInput>({
		name: '',
		description: { blocks: [] },
		slug: '',
		seo: {
			title: '',
			description: '',
		},
	});

	afterNavigate(() => {
		categoryQuery.reexecute({
			variables: {
				id: page.params.id,
			},
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
							type: ProductMediaType.Image,
						},
					];
				}
			}
		}),
	);

	const handleDeleteClick = () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'categoryDelete'>,
					MutationCategoryDeleteArgs
				>(CATEGORY_DELETE_MUTATION, { id: page.params.id! });
				loading = false;

				if (checkIfGraphqlResultHasError(result, 'categoryDelete', $CommonState.DeleteSuccess))
					return;

				await goto(AppRoute.SETTINGS_CONFIGS_CATEGORIES());
			},
		});
	};

	const handleUpdate = async () => {
		if (!generalFormOk) return;
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation(CATEGORY_UPDATE_MUTATION, {
			id: page.params.id,
			input: {
				...categoryInput,
				description: JSON.stringify(categoryInput.description),
				backgroundImage: media[0]?.file,
				backgroundImageAlt: media[0]?.alt,
			},
		});

		if (checkIfGraphqlResultHasError(result, 'categoryUpdate')) {
			loading = false;
			return;
		}

		const hasError = await metaRef?.handleUpdate();
		loading = false;
		if (hasError) return;

		toast.success($CommonState.EditSuccess);
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
	<div class="flex flex-row gap-2 tablet:flex-col">
		<div class="w-6/10 space-y-2 tablet:w-full">
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
				bind:this={metaRef}
				disabled={loading}
			/>
		</div>

		<SubSection categoryId={id} />
	</div>

	<ActionBar
		onUpdateClick={handleUpdate}
		onDeleteClick={handleDeleteClick}
		disabled={loading}
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_CATEGORIES()}
		disableUpdateButton={loading || !generalFormOk}
	/>
{/if}
