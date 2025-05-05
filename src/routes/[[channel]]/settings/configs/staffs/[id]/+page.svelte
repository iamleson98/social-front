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
		type QueryUserArgs
	} from '$lib/gql/graphql';
	import StaffDetailSkeleton from '$lib/components/pages/settings/config/staff/staff-detail-skeleton.svelte';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { toastStore } from '$lib/stores/ui/toast';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { goto } from '$app/navigation';
	import StaffForm from '$lib/components/pages/settings/config/staff/staff-form.svelte';

	const staffDetailQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
		kind: 'query',
		query: USER_DETAIL_QUERY,
		variables: { id: page.params.id },
		requestPolicy: 'cache-and-network'
	});

	let loading = $state(false);
	let initialIsActive = $state(false);
	let isActive = $state(false);

	$effect(() => {
		if ($staffDetailQuery.data?.user) {
			initialIsActive = $staffDetailQuery.data.user.isActive;
			isActive = initialIsActive;
		}
	});

	function onNothingChange() {
		return isActive === initialIsActive;
	}

	const handleUpdateStaff = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'staffUpdate'>,
			MutationStaffUpdateArgs
		>(STAFF_UPDATE_MUTATION, {
			id: $staffDetailQuery.data?.user?.id as string,
			input: {
				isActive: isActive
			}
		});

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'userUpdate')) {
			console.log(result);
			return;
		}
		toastStore.send({
			variant: 'success',
			message: 'Staff updated successfully'
		});

		staffDetailQuery.reexecute({
			variables: {
				id: page.params.id
			},
			context: {
				requestPolicy: 'network-only'
			}
		});
	};

	const handleDeleteStaff = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'staffDelete'>,
			MutationStaffDeleteArgs
		>(STAFF_DELETE_MUTATION, {
			id: $staffDetailQuery.data?.user?.id as string
		});

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'userDelete')) {
			console.log(result);
			return;
		}
		toastStore.send({
			variant: 'success',
			message: 'Staff deleted successfully'
		});

		goto(AppRoute.SETTINGS_CONFIGS_STAFFS());
	};
</script>

{#if $staffDetailQuery.fetching}
	<StaffDetailSkeleton />
{:else if $staffDetailQuery.error}
	<Alert variant="error" bordered size="sm">{$staffDetailQuery.error.message}</Alert>
{:else if $staffDetailQuery.data?.user}
	{@const { user } = $staffDetailQuery.data}
	<StaffForm
		avatar={user.avatar?.url}
		firstName={user.firstName}
		lastName={user.lastName}
		email={user.email}
		bind:isActive
		disabled={true}
	/>

	<div
		class="mt-5 sticky bottom-0 flex justify-between items-center bg-white p-2 border rounded-lg border-gray-200"
	>
		<Button color="red" disabled={loading} onclick={handleDeleteStaff}>Delete</Button>

		<div class="flex gap-2">
			<Button
				variant="light"
				color="gray"
				disabled={loading}
				href={AppRoute.SETTINGS_CONFIGS_STAFFS()}>Back</Button
			>
			<Button disabled={loading || onNothingChange()} onclick={handleUpdateStaff}>Update</Button>
		</div>
	</div>
{/if}
