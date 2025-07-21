<script lang="ts">
	import { page } from '$app/state';
	import { PERMISSION_GROUP_DETAIL_QUERY } from '$lib/api/admin/users';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralInformation from '$lib/components/pages/settings/permission-groups/general-information.svelte';
	import Permissions from '$lib/components/pages/settings/permission-groups/permissions.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import type {
		PermissionGroupUpdateInput,
		Query,
		QueryPermissionGroupArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
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
	});

	const loading = $state(false);

	const handleUpdate = async () => {};

	const handleDelete = async () => {};

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
	<SelectSkeleton />
{:else if $groupQuery.error}
	<Alert variant="error" bordered size="sm">{$groupQuery.error.message}</Alert>
{:else if $groupQuery.data?.permissionGroup}
	{@const { permissions, users, userCanManage } = $groupQuery.data.permissionGroup}
	<div class="flex gap-2">
		<GeneralInformation
			bind:name={permissionGroupInput.name!}
			bind:restrictedAccessToChannels={permissionGroupInput.restrictedAccessToChannels!}
			users={users || []}
			editable={userCanManage}
		/>
		<Permissions permissions={permissions || []} editable={userCanManage} />
	</div>
	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUPS()}
		onUpdateClick={handleUpdate}
		onDeleteClick={handleDelete}
		disabled={loading}
	/>
{/if}
