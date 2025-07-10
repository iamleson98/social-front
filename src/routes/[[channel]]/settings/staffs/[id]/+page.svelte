<script lang="ts">
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { STAFF_DELETE_MUTATION, STAFF_UPDATE_MUTATION } from '$lib/api/admin/staff';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type Mutation,
		type MutationStaffDeleteArgs,
		type MutationStaffUpdateArgs,
		type Query,
		type QueryUserArgs,
	} from '$lib/gql/graphql';
	import StaffDetailSkeleton from '$lib/components/pages/settings/staff/staff-detail-skeleton.svelte';
	import { AppRoute } from '$lib/utils';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { goto } from '$app/navigation';
	import StaffForm from '$lib/components/pages/settings/staff/staff-form.svelte';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import type { PageServerData } from './$types';
	import { tranFunc } from '$i18n';

	type Props = {
		data: PageServerData;
	};

	let { data }: Props = $props();

	const staffDetailQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
		kind: 'query',
		query: USER_DETAIL_QUERY,
		variables: { id: page.params.id },
		requestPolicy: 'cache-and-network',
	});

	let loading = $state(false);
	let initialIsActive = $state(false);
	let isActive = $state(false);
	let nothingChanged = $derived(isActive === initialIsActive);

	$effect(() => {
		if ($staffDetailQuery.data?.user) {
			initialIsActive = $staffDetailQuery.data.user.isActive;
			isActive = initialIsActive;
		}
	});

	const handleUpdateStaff = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'staffUpdate'>,
			MutationStaffUpdateArgs
		>(STAFF_UPDATE_MUTATION, {
			id: $staffDetailQuery.data?.user?.id as string,
			input: {
				isActive,
			},
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'staffUpdate', $tranFunc('staff.staffUpdated')))
			return;
		staffDetailQuery.reexecute({
			variables: {
				id: page.params.id,
			},
		});
	};

	const handleOpenDeleteModal = () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('staff.staffDeleteConfirm', { id: page.params.id }),
			onOk: handleDeleteStaff,
		});
	};

	const handleDeleteStaff = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'staffDelete'>,
			MutationStaffDeleteArgs
		>(STAFF_DELETE_MUTATION, {
			id: page.params.id,
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'staffDelete', $tranFunc('staff.staffDeleted')))
			return;
		await goto(AppRoute.SETTINGS_CONFIGS_STAFFS());
	};
</script>

{#if $staffDetailQuery.fetching}
	<StaffDetailSkeleton />
{:else if $staffDetailQuery.error}
	<Alert variant="error" bordered size="sm">{$staffDetailQuery.error.message}</Alert>
{:else if $staffDetailQuery.data?.user}
	{@const { avatar, firstName, lastName, email, dateJoined } = $staffDetailQuery.data.user}
	<StaffForm
		avatar={avatar?.url}
		{firstName}
		{lastName}
		{email}
		bind:isActive
		disabled={loading}
		isCreatePage={false}
		{dateJoined}
		canEdit={data.canEdit}
	/>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_STAFFS()}
		onUpdateClick={handleUpdateStaff}
		disabled={loading}
		onDeleteClick={handleOpenDeleteModal}
		disableUpdateButton={(!data.canEdit && !data.isStaffManager) || nothingChanged || loading}
		disableDeleteButton={!data.isStaffManager}
	/>
{/if}
