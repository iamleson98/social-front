<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ATTRIBUTE_DELETE_MUTATION, ATTRIBUTE_DETAILS_QUERY } from '$lib/api/admin/attribute';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import DetailSidebar from '$lib/components/pages/settings/attributes/detail-sidebar.svelte';
	import GeneralInformation from '$lib/components/pages/settings/attributes/general-information.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/warehouses/detail-skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		MeasurementUnitsEnum,
		type AttributeUpdateInput,
		type Mutation,
		type MutationAttributeDeleteArgs,
		type Query,
		type QueryAttributeArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const AttributeQuery = operationStore<Pick<Query, 'attribute'>, QueryAttributeArgs>({
		kind: 'query',
		query: ATTRIBUTE_DETAILS_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
	});

	let performUpdateMetadata = $state(false);
	let loading = $state(false);
	let attributeInput = $state<AttributeUpdateInput>({
		name: '',
		valueRequired: true,
		unit: MeasurementUnitsEnum.G,
	});

	onMount(() =>
		AttributeQuery.subscribe((result) => {
			if (result.data?.attribute) {
				const { name, slug, valueRequired, visibleInStorefront, unit } = result.data.attribute;

				attributeInput = {
					name,
					slug,
					valueRequired,
					visibleInStorefront,
					unit,
				};
			}
		}),
	);

	const handleClickDelete = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: `Are you sure to delete this attribute?`,
			onOk: async () => {
				loading = true;

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'attributeDelete'>,
					MutationAttributeDeleteArgs
				>(ATTRIBUTE_DELETE_MUTATION, {
					id: page.params.id,
				});

				loading = false;

				if (
					checkIfGraphqlResultHasError(result, 'attributeDelete', 'Successfully deleted attribute')
				)
					return;

				await goto(AppRoute.SETTINGS_CONFIGS_ATTRIBUTES());
			},
		});
	};

	const handleClickUpdate = async () => {};
</script>

{#if $AttributeQuery.fetching}
	<DetailSkeleton />
{:else if $AttributeQuery.error}
	<Alert variant="error" size="sm" bordered>{$AttributeQuery.error.message}</Alert>
{:else if $AttributeQuery.data?.attribute}
	{@const { metadata, privateMetadata, inputType, type } = $AttributeQuery.data.attribute}
	<div class="flex gap-2">
		<div class="w-7/10 space-y-2">
			<GeneralInformation
				bind:name={attributeInput.name!}
				bind:slug={attributeInput.slug!}
				bind:valueRequired={attributeInput.valueRequired!}
				inputType={inputType ?? undefined}
				disabled={loading}
			/>

			<GeneralMetadataEditor
				objectId={page.params.id}
				{metadata}
				{privateMetadata}
				bind:performUpdateMetadata
			/>
		</div>

		<div class="space-y-2 w-3/10">
			<DetailSidebar
				bind:visibleInStorefront={attributeInput.visibleInStorefront!}
				type={type ?? undefined}
			/>
		</div>
	</div>

	<ActionBar
		onDeleteClick={handleClickDelete}
		onUpdateClick={handleClickUpdate}
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_WAREHOUSES()}
		disabled={loading}
	/>
{/if}
