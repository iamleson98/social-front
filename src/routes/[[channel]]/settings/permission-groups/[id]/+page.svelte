<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		PERMISSION_GROUP_DELETE_MUTATION,
		PERMISSION_GROUP_DETAIL_QUERY,
		PERMISSION_GROUP_UPDATE_MUTATION,
	} from '$lib/api/admin/users';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralInformation from '$lib/components/pages/settings/permission-groups/general-information.svelte';
	import Permissions from '$lib/components/pages/settings/permission-groups/permissions.svelte';
	import Skeleton from '$lib/components/pages/settings/permission-groups/skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import type {
		Mutation,
		MutationPermissionGroupDeleteArgs,
		MutationPermissionGroupUpdateArgs,
		PermissionGroupUpdateInput,
		Query,
		QueryPermissionGroupArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { pick } from 'es-toolkit';
	import { onMount } from 'svelte';

	const groupQuery = operationStore<Pick<Query, 'permissionGroup'>, QueryPermissionGroupArgs>({
		kind: 'query',
		query: PERMISSION_GROUP_DETAIL_QUERY,
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
		requestPolicy: 'network-only',
	});

	let permissionGroupInput = $state<PermissionGroupUpdateInput>({
		restrictedAccessToChannels: false,
		name: '',
		addChannels: [],
		removeChannels: [],
		addPermissions: [],
		removePermissions: [],
		addUsers: [],
		removeUsers: [],
	});
	let generalFormOk = $state(false);

	let loading = $state(false);

	const handleUpdate = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'permissionGroupUpdate'>,
			MutationPermissionGroupUpdateArgs
		>(PERMISSION_GROUP_UPDATE_MUTATION, {
			id: page.params.id!,
			input: permissionGroupInput,
		});
		loading = false;

		if (
			!checkIfGraphqlResultHasError(
				result,
				'permissionGroupUpdate',
				$tranFunc('common.editSuccess'),
			)
		)
			groupQuery.reexecute({
				context: { requestPolicy: 'network-only' },
				variables: {
					id: page.params.id!,
				},
			});
	};

	const handleDelete = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('common.confirmDel'),
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'permissionGroupDelete'>,
					MutationPermissionGroupDeleteArgs
				>(PERMISSION_GROUP_DELETE_MUTATION, {
					id: page.params.id!,
				});
				loading = false;

				if (
					!checkIfGraphqlResultHasError(
						result,
						'permissionGroupDelete',
						$tranFunc('common.delSuccess'),
					)
				)
					await goto(AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUPS());
			},
		});
	};

	onMount(() =>
		groupQuery.subscribe((result) => {
			if (result.data?.permissionGroup) {
				const data = pick(result.data.permissionGroup, ['name', 'restrictedAccessToChannels']);

				permissionGroupInput = {
					...permissionGroupInput,
					...data,
				};
			}
		}),
	);
</script>

{#if $groupQuery.fetching}
	<Skeleton />
{:else if $groupQuery.error}
	<Alert variant="error" bordered size="sm">{$groupQuery.error.message}</Alert>
{:else if $groupQuery.data?.permissionGroup}
	{@const { permissions, users, userCanManage, accessibleChannels } =
		$groupQuery.data.permissionGroup}
	<div class="flex gap-2">
		<GeneralInformation
			bind:name={permissionGroupInput.name!}
			bind:restrictedAccessToChannels={permissionGroupInput.restrictedAccessToChannels!}
			bind:addChannels={permissionGroupInput.addChannels!}
			bind:removeChannels={permissionGroupInput.removeChannels!}
			users={users || []}
			editable={userCanManage}
			existingAccessibleChannels={accessibleChannels || []}
			disabled={loading}
			bind:addUsers={permissionGroupInput.addUsers!}
			bind:removeUsers={permissionGroupInput.removeUsers!}
			bind:formOk={generalFormOk}
		/>
		<Permissions permissions={permissions || []} editable={userCanManage} disabled={loading} />
	</div>
	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUPS()}
		onUpdateClick={handleUpdate}
		onDeleteClick={handleDelete}
		disableUpdateButton={!generalFormOk || loading}
		disabled={loading}
	/>
{/if}
