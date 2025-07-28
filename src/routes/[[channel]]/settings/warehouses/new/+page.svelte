<script lang="ts">
	import { goto } from '$app/navigation';
	import { tranFunc } from '$i18n';
	import { WAREHOUSE_CREATE_MUTATION } from '$lib/api/admin/warehouse';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import GeneralInformation from '$lib/components/pages/settings/warehouses/general-information.svelte';
	import {
		type Mutation,
		type MutationCreateWarehouseArgs,
		type WarehouseCreateInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { toast } from 'svelte-sonner';

	let warehouseInput = $state<WarehouseCreateInput>({
		name: '',
		slug: '',
		email: '',
		address: {},
	});

	let performUpdateMetadata = $state(false);
	let createdWarehouseID = $state('');
	let loading = $state(false);
	let generalFormOk = $state(false);

	const handleClickAdd = async () => {
		if (!generalFormOk) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'createWarehouse'>,
			MutationCreateWarehouseArgs
		>(WAREHOUSE_CREATE_MUTATION, {
			input: warehouseInput,
		});
		if (checkIfGraphqlResultHasError(result, 'createWarehouse')) return;

		createdWarehouseID = result.data?.createWarehouse?.warehouse?.id!;
		performUpdateMetadata = true;
	};

	const onDoneUpdateMeta = async () => {
		loading = false;
		toast.success($tranFunc('common.createSuccess'));
		await goto(AppRoute.SETTINGS_CONFIGS_WAREHOUSE_DETAILS(createdWarehouseID));
	};
</script>

<div class="space-y-2">
	<GeneralInformation
		bind:name={warehouseInput.name}
		bind:slug={warehouseInput.slug!}
		bind:email={warehouseInput.email!}
		bind:formOk={generalFormOk}
		disabled={loading}
		isCreatePage
	/>

	<GeneralMetadataEditor
		metadata={[]}
		privateMetadata={[]}
		bind:performUpdateMetadata
		objectId={createdWarehouseID}
		onDoneUpdate={onDoneUpdateMeta}
		disabled={loading}
	/>
</div>

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_WAREHOUSES()}
	disabled={loading}
	onAddClick={handleClickAdd}
	disableCreateButton={!generalFormOk}
/>
