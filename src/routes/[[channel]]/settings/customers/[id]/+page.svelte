<script lang="ts">
	import { page } from '$app/state';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import CustomerInformationForm from '$lib/components/pages/settings/customers/customer-information-form.svelte';
	import SkeletonCustomerDetail from '$lib/components/pages/settings/customers/skeleton-customer-detail.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type CustomerInput,
		type Mutation,
		type Query,
		type QueryUserArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { USER_UPDATE_MUTATION } from '$lib/api/account';
	import { type MutationCustomerUpdateArgs } from '$lib/gql/graphql';
	import CustomerExtraForm from '$lib/components/pages/settings/customers/customer-extra-form.svelte';
	import { onMount } from 'svelte';
	import CustomerOrders from '$lib/components/pages/settings/customers/customer-orders.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import { tranFunc } from '$i18n';
	import { toast } from 'svelte-sonner';

	const userDetailQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
		query: USER_DETAIL_QUERY,
		requestPolicy: 'network-only',
		variables: {
			id: page.params.id,
		},
	});

	let loading = $state(false);
	let informationOk = $state(false);
	let userInput = $state<CustomerInput>({
		lastName: '',
		firstName: '',
		email: '',
		isActive: false,
		note: '',
	});
	let metaRef = $state<any>();

	onMount(() =>
		userDetailQuery.subscribe((result) => {
			if (result.data?.user) {
				const { firstName, lastName, email, isActive, note } = result.data.user;
				userInput = {
					firstName,
					lastName,
					email,
					isActive,
					note,
				};
			}
		}),
	);

	const onUpdateClick = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'customerUpdate'>,
			MutationCustomerUpdateArgs
		>(USER_UPDATE_MUTATION, {
			id: page.params.id,
			input: userInput,
		});

		if (checkIfGraphqlResultHasError(result, 'customerUpdate')) {
			loading = false;
			return;
		}

		const hasErr = await metaRef?.handleUpdate();
		loading = false;
		if (hasErr) return;

		toast.success($tranFunc('common.editSuccess'));
		userDetailQuery.reexecute({ variables: { id: page.params.id } });
	};
</script>

{#if $userDetailQuery.fetching}
	<SkeletonCustomerDetail />
{:else if $userDetailQuery.error}
	<Alert variant="error" size="sm" bordered>{$userDetailQuery.error.message}</Alert>
{:else if $userDetailQuery.data?.user}
	{@const { user } = $userDetailQuery.data}

	<div class="flex gap-2">
		<div class="w-6/10 space-y-2">
			<CustomerInformationForm
				firstName={userInput.firstName!}
				lastName={userInput.lastName!}
				email={userInput.email!}
				bind:isActive={userInput.isActive!}
				note={userInput.note!}
				bind:ok={informationOk}
				disabled={loading}
			/>
			<CustomerOrders id={user.id} disabled={loading} />
			<GeneralMetadataEditor
				metadata={user.metadata}
				privateMetadata={user.privateMetadata}
				objectId={user.id}
				bind:this={metaRef}
				disabled={loading}
			/>
		</div>

		<CustomerExtraForm {user} disabled={loading} />
	</div>
	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_USERS()}
		{onUpdateClick}
		disabled={loading}
		disableCreateButton={loading}
	/>
{/if}
