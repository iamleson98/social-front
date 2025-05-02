<script lang="ts">
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { STAFF_DETAILS_QUERY, STAFF_UPDATE_MUTATION } from '$lib/api/admin/staff';
	import { Alert } from '$lib/components/ui/Alert';
	import StaffForm from '$lib/components/pages/settings/config/staff/staff-form.svelte';
	import { type Mutation, type MutationStaffUpdateArgs, type Query, type StaffUpdateInput, type User } from '$lib/gql/graphql';
	import StaffDetailSkeleton from '$lib/components/pages/settings/config/staff/staff-detail-skeleton.svelte';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { toastStore } from '$lib/stores/ui/toast';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';

	const staffDetailQuery = operationStore<Pick<Query, 'user'>>({
		kind: 'query',
		query: STAFF_DETAILS_QUERY,
		variables: { id: page.params.id },
		requestPolicy: 'network-only'
	});

	let loading = $state(false);
	let formOk = $state(false);
  let oldStaff = $state.raw<StaffUpdateInput>();

  let staffValues = $state<StaffUpdateInput>({
    lastName: '',
    firstName: '',
    isActive: false,
    email: '',
    
  });

	const handleUpdateStaff = async () => {
		if (!formOk) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'staffUpdate'>, MutationStaffUpdateArgs>(
			STAFF_UPDATE_MUTATION,
			{
				id: $staffDetailQuery.data?.user?.id as string,
				input: {
					lastName: staffValues.lastName,
					firstName: staffValues.firstName,
					isActive: staffValues.isActive,
					email: staffValues.email
				}
			}
		);

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'userUpdate')) return;
		toastStore.send({
			variant: 'success',
			message: 'User updated successfully'
		});

		await goto(AppRoute.SETTINGS_CONFIGS_STAFFS(), {
			replaceState: true,
			invalidateAll: true
		});
	};
</script>

{#if $staffDetailQuery.fetching}
	<StaffDetailSkeleton />
{:else if $staffDetailQuery.error}
	<Alert variant="error" bordered>{$staffDetailQuery.error.message}</Alert>
{:else if $staffDetailQuery.data?.user}
	{@const { user } = $staffDetailQuery.data}
	<div class="h-full w-full rounded-lg bg-white border border-gray-200 p-4">
		<StaffForm
      bind:lastName={user.lastName}
      bind:firstName={user.firstName}
      bind:email={user.email}
      bind:isActive={user.isActive}
      bind:formOk
      disabled={loading}
    />
	</div>
  <div
			class="mt-5 sticky bottom-0 flex justify-between items-center bg-white p-2 border rounded-lg border-gray-200"
		>
			<Button color="red" disabled={loading} onclick={() => (loading = true)}>
				Delete
			</Button>

			<div class="flex gap-2">
				<Button
					variant="light"
					color="gray"
					disabled={loading}
					href={AppRoute.SETTINGS_CONFIGS_STAFFS()}>Back</Button
				>
				<Button disabled={loading || !formOk} onclick={handleUpdateStaff}
					>Update</Button
				>
			</div>
		</div>
{/if}
