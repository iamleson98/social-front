<script lang="ts">
	import { goto } from '$app/navigation';
	import { tranFunc } from '$i18n';
	import { PERMISSION_GROUP_CREATE_MUTATION } from '$lib/api/admin/users';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralInformation from '$lib/components/pages/settings/permission-groups/general-information.svelte';
	import Permissions from '$lib/components/pages/settings/permission-groups/permissions.svelte';
	import {
		type Mutation,
		type MutationPermissionGroupCreateArgs,
		type PermissionGroupCreateInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	let groupInput = $state<PermissionGroupCreateInput>({
		name: '',
		restrictedAccessToChannels: false,
		addChannels: [],
		addPermissions: [],
		addUsers: [],
	});

	let loading = $state(false);
	let generalFormOk = $state(false);

	const handleCreate = async () => {
		if (!generalFormOk) return;
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'permissionGroupCreate'>,
			MutationPermissionGroupCreateArgs
		>(PERMISSION_GROUP_CREATE_MUTATION, {
			input: groupInput,
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'permissionGroupCreate',
				$tranFunc('common.createSuccess'),
			)
		)
			return;

		const createdGroupId = result.data?.permissionGroupCreate?.group?.id;

		await goto(AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUP_DETAIL(createdGroupId!));
	};
</script>

<div class="flex gap-2">
	<GeneralInformation
		bind:name={groupInput.name!}
		bind:restrictedAccessToChannels={groupInput.restrictedAccessToChannels!}
		bind:formOk={generalFormOk}
		editable
		disabled={loading}
		bind:addUsers={groupInput.addUsers!}
		bind:addChannels={groupInput.addChannels!}
	/>
	<Permissions bind:addPermissions={groupInput.addPermissions!} editable disabled={loading} />
</div>

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUPS()}
	onAddClick={handleCreate}
	disabled={loading}
	disableCreateButton={!generalFormOk}
/>
