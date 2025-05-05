<script lang="ts">
	import { STAFF_CREATE_MUTATION } from '$lib/api/admin/staff';
	import { type Mutation, type MutationStaffCreateArgs } from '$lib/gql/graphql';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { toastStore } from '$lib/stores/ui/toast';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import StaffForm from '$lib/components/pages/settings/config/staff/staff-form.svelte';
	import { goto } from '$app/navigation';

	let loading = $state(false);
	let formOk = $state(false);
	let user = $state({
		avatar: '',
		firstName: '',
		lastName: '',
		email: '',
		isActive: false
	});

	const handleAddStaff = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'staffCreate'>,
			MutationStaffCreateArgs
		>(STAFF_CREATE_MUTATION, {
			input: {
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				isActive: user.isActive
			}
		});

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'userCreate')) {
			console.log(result);
			return;
		}
		toastStore.send({
			variant: 'success',
			message: 'Staff created successfully'
		});

		goto(AppRoute.SETTINGS_CONFIGS_STAFFS());
	};
</script>

<div class="h-full w-full">
	<StaffForm
		bind:lastName={user.lastName}
		bind:firstName={user.firstName}
		bind:email={user.email}
		bind:isActive={user.isActive}
		disabled={loading}
		bind:formOk
	/>

  <div
		class="mt-5 sticky bottom-0 flex justify-between items-center bg-white p-2 border rounded-lg border-gray-200"
	>
  <Button
				variant="light"
				color="gray"
				disabled={loading}
				href={AppRoute.SETTINGS_CONFIGS_STAFFS()}>Back</Button
			>
			<Button disabled={loading || !formOk} onclick={handleAddStaff}>Add</Button>
	</div>
</div>
