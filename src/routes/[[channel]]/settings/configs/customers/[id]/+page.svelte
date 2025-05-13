<script lang="ts">
	import { goto, afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import CustomerInformationForm from '$lib/components/pages/settings/config/customers/customer-information-form.svelte';
	import CustomerStatisticalForm from '$lib/components/pages/settings/config/customers/customer-statistical-form.svelte';
	import SkeletonCustomerDetail from '$lib/components/pages/settings/config/customers/skeleton-customer-detail.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type Address,
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

	const userDetailQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
		kind: 'query',
		query: USER_DETAIL_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: page.params.id
		}
	});

	let loading = $state(false);

	let userInput = $state<User>({
		lastName: '',
		firstName: '',
		email: '',
		isActive: false,
		note: '',
		metadata: [],
		privateMetadata: [],
		addresses: [],
		id: '',
		dateJoined: undefined,
		isConfirmed: false,
		isStaff: false,
		languageCode: LanguageCodeEnum.Af,
		restrictedAccessToChannels: false,
		updatedAt: undefined
	});

	$effect(() => {
		if ($userDetailQuery.data?.user) {
			const { firstName, lastName, email, isActive, note, metadata, privateMetadata, addresses } =
				$userDetailQuery.data.user;
			userInput = {
				firstName,
				lastName,
				email,
				isActive,
				note,
				metadata,
				privateMetadata,
				addresses,
				id: page.params.id,
				dateJoined: undefined,
				isConfirmed: false,
				isStaff: false,
				languageCode: LanguageCodeEnum.Af,
				restrictedAccessToChannels: false,
				updatedAt: undefined
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
				isActive: userInput.isActive
			}
		});

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'customerUpdate')) return;
		toastStore.send({
			variant: 'success',
			message: 'Customer updated successfully'
		});

		await goto(AppRoute.SETTINGS_CONFIGS_USERS(), {
			replaceState: true,
			invalidateAll: true
		});
	};

	afterNavigate(() => {
		userDetailQuery.reexecute({ variables: { id: page.params.id } });
	});
</script>

{#if $userDetailQuery.fetching}
	<SkeletonCustomerDetail />
{:else if $userDetailQuery.error}
	<Alert variant="error" size="sm" bordered>{$userDetailQuery.error.message}</Alert>
{:else if $userDetailQuery.data?.user}
	<div class="flex flex-row gap-2 w-full">
		<div class="w-2/5">
			<CustomerInformationForm
				bind:firstName={userInput.firstName as string}
				bind:lastName={userInput.lastName as string}
				bind:email={userInput.email as string}
				bind:isActive={userInput.isActive as boolean}
				bind:note={userInput.note as string}
				disabled
			/>
		</div>

		<CustomerStatisticalForm
			id={page.params.id}
			addresses={userInput.addresses as Address[]}
			bind:metadata={userInput.metadata as MetadataInput[]}
			bind:privateMetadata={userInput.privateMetadata as MetadataInput[]}
		/>
	</div>
	<ActionBar backButtonUrl={AppRoute.SETTINGS_CONFIGS_USERS()} {onUpdateClick} />
{/if}
