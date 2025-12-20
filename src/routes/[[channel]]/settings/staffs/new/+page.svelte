<script lang="ts">
	import { goto } from '$app/navigation';
	import { T } from '$i18n';
	import { STAFF_CREATE_MUTATION } from '$lib/api/admin/staff';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import StaffForm from '$lib/components/pages/settings/staff/staff-form.svelte';
	import {
		type Mutation,
		type MutationStaffCreateArgs,
		type StaffCreateInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import type { PageServerData } from './$types';

	type Props = {
		data: PageServerData;
	};

	let { data }: Props = $props();

	let loading = $state(false);
	let formOk = $state(false);
	let staffCreateInput = $state<StaffCreateInput>({
		firstName: '',
		lastName: '',
		email: '',
		isActive: false,
		addGroups: [],
	});

	const handleAddStaff = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'staffCreate'>,
			MutationStaffCreateArgs
		>(STAFF_CREATE_MUTATION, {
			input: staffCreateInput,
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'staffCreate', $T('staff.staffCreated')))
			return;

		await goto(AppRoute.SETTINGS_CONFIGS_STAFF_DETAILS(result.data?.staffCreate?.user?.id!));
	};
</script>

<StaffForm
	bind:lastName={staffCreateInput.lastName!}
	bind:firstName={staffCreateInput.firstName!}
	bind:email={staffCreateInput.email!}
	bind:isActive={staffCreateInput.isActive!}
	bind:formOk
	bind:addGroups={staffCreateInput.addGroups!}
	disabled={loading}
	isCreatePage
	isStaffManager={data.canCreate}
/>

<ActionBar
	disabled={loading}
	onAddClick={handleAddStaff}
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_STAFFS()}
	disableBackButton={loading}
	disableCreateButton={!formOk}
/>
