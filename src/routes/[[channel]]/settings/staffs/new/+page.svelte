<script lang="ts">
	import { STAFF_CREATE_MUTATION } from '$lib/api/admin/staff';
	import { type Mutation, type MutationStaffCreateArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import StaffForm from '$lib/components/pages/settings/staff/staff-form.svelte';
	import { goto } from '$app/navigation';
	import { tranFunc } from '$i18n';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';

	let loading = $state(false);
	let formOk = $state(false);
	let user = $state({
		avatar: '',
		firstName: '',
		lastName: '',
		email: '',
		isActive: false,
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
				isActive: user.isActive,
			},
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'staffCreate', $tranFunc('staff.staffCreated')))
			return;

		await goto(AppRoute.SETTINGS_CONFIGS_STAFFS());
	};
</script>

<StaffForm
	bind:lastName={user.lastName}
	bind:firstName={user.firstName}
	bind:email={user.email}
	bind:isActive={user.isActive}
	disabled={loading}
	bind:formOk
	isCreatePage={true}
/>

<ActionBar
	disabled={loading}
	onAddClick={handleAddStaff}
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_STAFFS()}
	disableBackButton={loading}
	disableCreateButton={!formOk}
/>
