<script lang="ts">
	import { CREATE_USER_MUTATION } from '$lib/api/admin/users';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import CustomerInformationForm from '$lib/components/pages/settings/customers/customer-information-form.svelte';
	import type { Mutation, MutationCustomerCreateArgs, UserCreateInput } from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { AppRoute } from '$lib/utils';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import { CommonState } from '$lib/utils/common.svelte';

	let userInput = $state<UserCreateInput>({
		firstName: '',
		lastName: '',
		email: '',
		isActive: true,
		note: '',
	});
	let generalFormOk = $state(false);
	let loading = $state(false);
	let metaRef = $state<any>();

	const onCreateClick = async () => {
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'customerCreate'>,
			MutationCustomerCreateArgs
		>(CREATE_USER_MUTATION, {
			input: userInput,
		});

		if (checkIfGraphqlResultHasError(result, 'customerCreate')) {
			loading = false;
			return;
		}

		const hasErr = await metaRef?.handleUpdate(result.data?.customerCreate?.user?.id!);
		loading = false;
		if (hasErr) return;

		toast.success(CommonState.CreateSuccess);
		await goto(AppRoute.SETTINGS_CONFIGS_USER_DETAILS(result.data?.customerCreate?.user?.id!));
	};
</script>

<div class="space-y-2">
	<CustomerInformationForm
		firstName={userInput.firstName!}
		lastName={userInput.lastName!}
		email={userInput.email!}
		bind:isActive={userInput.isActive!}
		note={userInput.note!}
		bind:ok={generalFormOk}
		disabled={loading}
		isCreatePage
	/>
	<GeneralMetadataEditor objectId={''} bind:this={metaRef} disabled={loading} />
</div>

<ActionBar
	onAddClick={onCreateClick}
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_USERS()}
	disableCreateButton={loading || !generalFormOk}
/>
