<script lang="ts">
	import { page } from '$app/state';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import CustomerInformationForm from '$lib/components/pages/settings/config/customers/customer-information-form.svelte';
	import SkeletonCustomerDetail from '$lib/components/pages/settings/config/customers/skeleton-customer-detail.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type CustomerInput,
		type MetadataInput,
		type Mutation,
		type Query,
		type QueryUserArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { USER_UPDATE_MUTATION } from '$lib/api/account';
	import { type MutationCustomerUpdateArgs } from '$lib/gql/graphql';
	import CustomerExtraForm from '$lib/components/pages/settings/config/customers/customer-extra-form.svelte';
	import { onMount } from 'svelte';

	const userDetailQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
		kind: 'query',
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
		metadata: [],
		privateMetadata: [],
	});

	onMount(() =>
		userDetailQuery.subscribe((result) => {
			if (result.data?.user) {
				const { firstName, lastName, email, isActive, note, metadata, privateMetadata } =
					result.data.user;
				userInput = {
					firstName,
					lastName,
					email,
					isActive,
					note,
					metadata,
					privateMetadata,
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
		loading = false;
		if (checkIfGraphqlResultHasError(result, 'customerUpdate', 'Customer updated successfully'))
			return;
		userDetailQuery.reexecute({ variables: { id: page.params.id } });
	};
</script>

{#if $userDetailQuery.fetching}
	<SkeletonCustomerDetail />
{:else if $userDetailQuery.error}
	<Alert variant="error" size="sm" bordered>{$userDetailQuery.error.message}</Alert>
{:else if $userDetailQuery.data?.user}
	{@const { user } = $userDetailQuery.data}
	{@const orders = user.orders?.edges.map((edge) => edge.node) ?? []}
	<div class="flex flex-row gap-2 w-full">
		<div class="w-6/10">
			<CustomerInformationForm
				{orders}
				firstName={userInput.firstName as string}
				lastName={userInput.lastName as string}
				email={userInput.email as string}
				bind:isActive={userInput.isActive as boolean}
				note={userInput.note as string}
				bind:metadata={userInput.metadata as MetadataInput[]}
				bind:privateMetadata={userInput.privateMetadata as MetadataInput[]}
				bind:ok={informationOk}
			/>
		</div>

		<CustomerExtraForm
			addresses={user.addresses}
			lastLoginTime={user.lastLogin}
			lastOrderAt={orders.length > 0 ? orders[0].created : undefined}
			giftCards={user.giftCards?.edges.map((edge) => edge.node) ?? []}
			userEmail={user.email}
			userName={user.firstName + ' ' + $userDetailQuery.data?.user.lastName}
		/>
	</div>
	<ActionBar backButtonUrl={AppRoute.SETTINGS_CONFIGS_USERS()} {onUpdateClick} disabled={loading} />
{/if}
