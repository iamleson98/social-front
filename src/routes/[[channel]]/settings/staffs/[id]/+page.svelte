<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { STAFF_DELETE_MUTATION, STAFF_UPDATE_MUTATION } from '$lib/api/admin/staff';
	import { USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import StaffDetailSkeleton from '$lib/components/pages/settings/staff/staff-detail-skeleton.svelte';
	import StaffForm from '$lib/components/pages/settings/staff/staff-form.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type StaffUpdateInput,
		type Mutation,
		type MutationStaffDeleteArgs,
		type MutationStaffUpdateArgs,
		type Query,
		type QueryUserArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import type { PageServerData } from './$types';
	import { onMount } from 'svelte';

	type Props = {
		data: PageServerData;
	};

	let { data }: Props = $props();

	const staffDetailQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
		query: USER_DETAIL_QUERY,
		variables: { id: page.params.id },
		requestPolicy: 'cache-and-network',
	});

	let loading = $state(false);
	let staffUpdateInput = $state<StaffUpdateInput>({
		isActive: false,
		addGroups: [],
		removeGroups: [],
		firstName: '',
		lastName: '',
		email: '',
	});

	onMount(() =>
		staffDetailQuery.subscribe((result) => {
			if (result.data?.user) {
				const { isActive, firstName, lastName, email } = result.data.user;
				staffUpdateInput = {
					...staffUpdateInput,
					isActive,
					firstName,
					lastName,
					email,
				};
			}
		}),
	);

	const handleUpdateStaff = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'staffUpdate'>,
			MutationStaffUpdateArgs
		>(STAFF_UPDATE_MUTATION, {
			id: $staffDetailQuery.data?.user?.id as string,
			input: staffUpdateInput,
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
			id: page.params.id!,
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
	{@const { avatar, dateJoined, permissionGroups } =
		$staffDetailQuery.data.user}
	<StaffForm
		avatar={avatar?.url}
		bind:firstName={staffUpdateInput.firstName!}
		bind:lastName={staffUpdateInput.lastName!}
		bind:email={staffUpdateInput.email!}
		bind:isActive={staffUpdateInput.isActive!}
		bind:addGroups={staffUpdateInput.addGroups!}
		bind:removeGroups={staffUpdateInput.removeGroups!}
		existingGroups={permissionGroups?.map((group) => group.id)}
		disabled={loading}
		isCreatePage={false}
		{dateJoined}
		canEdit={data.canEdit}
		isStaffManager={data.isStaffManager}
	/>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_STAFFS()}
		onUpdateClick={handleUpdateStaff}
		disabled={loading}
		onDeleteClick={handleOpenDeleteModal}
		disableUpdateButton={(!data.canEdit && !data.isStaffManager) || loading}
		disableDeleteButton={!data.isStaffManager}
	/>
{/if}
