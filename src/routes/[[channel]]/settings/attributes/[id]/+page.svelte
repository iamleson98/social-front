<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		ATTRIBUTE_DELETE_MUTATION,
		ATTRIBUTE_DETAILS_QUERY,
		ATTRIBUTE_UPDATE_MUTATION,
	} from '$lib/api/admin/attribute';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import AttributeValues from '$lib/components/pages/settings/attributes/attribute-values.svelte';
	import DetailSidebar from '$lib/components/pages/settings/attributes/detail-sidebar.svelte';
	import GeneralInformation from '$lib/components/pages/settings/attributes/general-information.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/warehouses/detail-skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		AttributeTypeEnum,
		MeasurementUnitsEnum,
		type AttributeUpdateInput,
		type Mutation,
		type MutationAttributeDeleteArgs,
		type MutationAttributeUpdateArgs,
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
	let generalFormOk = $state(false);
	let attributeInput = $state<AttributeUpdateInput>({
		name: '',
		valueRequired: true,
		unit: MeasurementUnitsEnum.G,
		visibleInStorefront: true,
		slug: '',
		addValues: [],
		removeValues: [],
	});

	onMount(() =>
		AttributeQuery.subscribe((result) => {
			if (result.data?.attribute) {
				const { name, slug, valueRequired, visibleInStorefront, unit } = result.data.attribute;

				attributeInput = {
					...attributeInput,
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
			content: $tranFunc('common.confirmDel'),
			onOk: async () => {
				loading = true;

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'attributeDelete'>,
					MutationAttributeDeleteArgs
				>(ATTRIBUTE_DELETE_MUTATION, {
					id: page.params.id,
				});

				loading = false;

				if (checkIfGraphqlResultHasError(result, 'attributeDelete', $tranFunc('common.delSuccess')))
					return;

				await goto(AppRoute.SETTINGS_CONFIGS_ATTRIBUTES());
			},
		});
	};

	const handleClickUpdate = async () => {
		loading = true;
		performUpdateMetadata = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'attributeUpdate'>,
			MutationAttributeUpdateArgs
		>(ATTRIBUTE_UPDATE_MUTATION, {
			id: page.params.id,
			input: attributeInput,
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'attributeUpdate', $tranFunc('common.editSuccess')))
			return;

		AttributeQuery.reexecute({
			context: { requestPolicy: 'network-only' },
			variables: { id: page.params.id },
		});
	};
</script>

{#if $AttributeQuery.fetching}
	<DetailSkeleton />
{:else if $AttributeQuery.error}
	<Alert variant="error" size="sm" bordered>{$AttributeQuery.error.message}</Alert>
{:else if $AttributeQuery.data?.attribute}
	{@const { metadata, privateMetadata, inputType, type, withChoices, id } =
		$AttributeQuery.data.attribute}
	<div class="flex gap-2 tablet:flex-col">
		<div class="w-7/10 space-y-2 tablet:w-full">
			<GeneralInformation
				bind:name={attributeInput.name!}
				bind:slug={attributeInput.slug!}
				bind:valueRequired={attributeInput.valueRequired!}
				inputType={inputType!}
				disabled={loading}
				bind:formOk={generalFormOk}
			/>
			<AttributeValues
				{withChoices}
				inputType={inputType!}
				attributeID={id}
				bind:addValues={attributeInput.addValues!}
				bind:removeValues={attributeInput.removeValues!}
			/>
			<GeneralMetadataEditor
				objectId={id}
				{metadata}
				{privateMetadata}
				bind:performUpdateMetadata
				disabled={loading}
			/>
		</div>

		<DetailSidebar
			bind:visibleInStorefront={attributeInput.visibleInStorefront!}
			type={type || AttributeTypeEnum.ProductType}
		/>
	</div>

	<ActionBar
		onDeleteClick={handleClickDelete}
		onUpdateClick={handleClickUpdate}
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_WAREHOUSES()}
		disabled={loading}
		disableUpdateButton={!generalFormOk}
	/>
{/if}
