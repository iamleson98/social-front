<script lang="ts">
	import { goto, afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import CustomerInformationForm from '$lib/components/pages/settings/config/customers/customer-information-form.svelte';
	import SkeletonCustomerDetail from '$lib/components/pages/settings/config/customers/skeleton-customer-detail.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type Address,
		type CustomerInput,
		type MetadataInput,
		type Mutation,
		type Query,
		type QueryUserArgs,
		type User
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { USER_UPDATE_MUTATION } from '$lib/api/account';
	import { LanguageCodeEnum, type MutationCustomerUpdateArgs } from '$lib/gql/graphql';
	import { toastStore } from '$lib/stores/ui/toast';
	import { omit } from 'es-toolkit';
	import CustomerExtraForm from '$lib/components/pages/settings/config/customers/customer-extra-form.svelte';

	const userDetailQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
		kind: 'query',
		query: USER_DETAIL_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: page.params.id
		}
	});

	let loading = $state(false);

	let userInput = $state<CustomerInput>({
		lastName: '',
		firstName: '',
		email: '',
		isActive: false,
		note: '',
		metadata: [],
		privateMetadata: []
	});

	$effect(() => {
		if ($userDetailQuery.data?.user) {
			const { firstName, lastName, email, isActive, note, metadata, privateMetadata } =
				$userDetailQuery.data.user;
			userInput = {
				firstName,
				lastName,
				email,
				isActive,
				note,
				metadata,
				privateMetadata
			};
		}
	});

	const onUpdateClick = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'customerUpdate'>,
			MutationCustomerUpdateArgs
		>(USER_UPDATE_MUTATION, {
			id: $userDetailQuery.data?.user?.id as string,
			input: {
				isActive: userInput.isActive,
				metadata: userInput.metadata,
				privateMetadata: userInput.privateMetadata
			}
		});

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'customerUpdate', 'Customer updated successfully'))
			return;

		userDetailQuery.reexecute({ variables: { id: page.params.id } });
	};
</script>

{#if $userDetailQuery.fetching}
	<SkeletonCustomerDetail />
{:else if $userDetailQuery.error}
	<Alert variant="error" size="sm" bordered>{$userDetailQuery.error.message}</Alert>
{:else if $userDetailQuery.data?.user}
	{@const orders = $userDetailQuery.data.user.orders?.edges.map((edge) => edge.node) ?? []}
	<div class="flex flex-row gap-2 w-full">
		<div class="w-6/10">
			<CustomerInformationForm
				{orders}
				bind:firstName={userInput.firstName as string}
				bind:lastName={userInput.lastName as string}
				bind:email={userInput.email as string}
				bind:isActive={userInput.isActive as boolean}
				bind:note={userInput.note as string}
				disabled
			/>
		</div>

		<CustomerExtraForm
			id={page.params.id}
			addresses={$userDetailQuery.data?.user.addresses}
			bind:metadata={userInput.metadata as MetadataInput[]}
			bind:privateMetadata={userInput.privateMetadata as MetadataInput[]}
		/>
	</div>
	<ActionBar backButtonUrl={AppRoute.SETTINGS_CONFIGS_USERS()} {onUpdateClick} />
{/if}
