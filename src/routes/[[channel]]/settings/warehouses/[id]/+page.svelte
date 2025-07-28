<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		WAREHOUSE_DELETE_MUTATION,
		WAREHOUSE_DETAIL_QUERY,
		WAREHOUSE_UPDATE_MUTATION,
	} from '$lib/api/admin/warehouse';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DetailSidebar from '$lib/components/pages/settings/warehouses/detail-sidebar.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/warehouses/detail-skeleton.svelte';
	import GeneralInformation from '$lib/components/pages/settings/warehouses/general-information.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		WarehouseClickAndCollectOptionEnum,
		type Mutation,
		type MutationDeleteWarehouseArgs,
		type MutationUpdateWarehouseArgs,
		type Query,
		type QueryWarehouseArgs,
		type WarehouseUpdateInput,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { pick } from 'es-toolkit';
	import { onMount } from 'svelte';

	const warehouseQuery = operationStore<Pick<Query, 'warehouse'>, QueryWarehouseArgs>({
		kind: 'query',
		query: WAREHOUSE_DETAIL_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
	});

	let loading = $state(false);
	let warehouseInput = $state<WarehouseUpdateInput>({
		isPrivate: false,
		clickAndCollectOption: WarehouseClickAndCollectOptionEnum.Disabled,
		name: '',
		slug: '',
		email: '',
	});
	let performUpdateMetadata = $state(false);
	let generalFormOk = $state(false);

	onMount(() =>
		warehouseQuery.subscribe((result) => {
			if (result.data?.warehouse) {
				warehouseInput = pick(result.data.warehouse, [
					'name',
					'slug',
					'email',
					'externalReference',
					'isPrivate',
					'clickAndCollectOption',
				]);
			}
		}),
	);

	const handleClickDelete = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('common.confirmDel'),
			onOk: async () => {
				loading = true;

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'deleteWarehouse'>,
					MutationDeleteWarehouseArgs
				>(WAREHOUSE_DELETE_MUTATION, {
					id: page.params.id!,
				});

				loading = false;

				if (checkIfGraphqlResultHasError(result, 'deleteWarehouse', $tranFunc('common.delSuccess')))
					return;

				await goto(AppRoute.SETTINGS_CONFIGS_WAREHOUSES());
			},
		});
	};

	const handleClickUpdate = async () => {
		if (!generalFormOk) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'updateWarehouse'>,
			MutationUpdateWarehouseArgs
		>(WAREHOUSE_UPDATE_MUTATION, {
			id: page.params.id,
			input: warehouseInput,
		});
		performUpdateMetadata = true;
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'updateWarehouse', $tranFunc('common.editSuccess')))
			return;

		warehouseQuery.reexecute({
			context: { requestPolicy: 'network-only' },
			variables: { id: page.params.id },
		});
	};
</script>

{#if $warehouseQuery.fetching}
	<DetailSkeleton />
{:else if $warehouseQuery.error}
	<Alert variant="error" size="sm" bordered>{$warehouseQuery.error.message}</Alert>
{:else if $warehouseQuery.data?.warehouse}
	{@const { address, metadata, privateMetadata, id } = $warehouseQuery.data.warehouse}
	<div class="flex gap-2">
		<div class="w-6/10 space-y-2">
			<GeneralInformation
				bind:name={warehouseInput.name!}
				bind:slug={warehouseInput.slug!}
				bind:email={warehouseInput.email!}
				{address}
				disabled={loading}
				bind:formOk={generalFormOk}
			/>

			<GeneralMetadataEditor
				objectId={id}
				{metadata}
				{privateMetadata}
				bind:performUpdateMetadata
				disabled={loading}
			/>
		</div>

		<div class="space-y-2 w-4/10">
			<DetailSidebar
				bind:isPrivate={warehouseInput.isPrivate!}
				bind:clickAndCollectOption={warehouseInput.clickAndCollectOption!}
				disabled={loading}
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
