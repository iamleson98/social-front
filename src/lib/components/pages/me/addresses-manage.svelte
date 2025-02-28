<script lang="ts">
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Label } from '$lib/components/ui/Input';
	import { userStore } from '$lib/stores/auth';
	import AddressForm from '../checkout/address-form.svelte';
	import type {
		Address,
		AddressInput,
		AddressTypeEnum,
		Mutation,
		MutationAccountAddressCreateArgs,
		MutationAccountAddressDeleteArgs,
		MutationAccountAddressUpdateArgs,
		User
	} from '$lib/gql/graphql';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { CHANNEL_KEY } from '$lib/utils/consts';
	import { DEFAULT_CHANNEL } from '$lib/utils/channels';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import {
		ACCOUNT_ADDRESS_CREATE_MUTATION,
		ACCOUNT_ADDRESS_DELETE_MUTATION,
		ACCOUNT_ADDRESS_UPDATE_MUTATION
	} from '$lib/api/account';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { toastStore } from '$lib/stores/ui/toast';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';

	let showAddressCreateForm = $state(false);
	let loading = $state(false);
	let addressUpdateInputInitValue = $state<Address>();

	const handleShowAddressForm = (showCreateForm: boolean, defaultAddress?: Address) => {
		showAddressCreateForm = showCreateForm;
		addressUpdateInputInitValue = defaultAddress;
	};

	const handleUpdateAddress = async (input: AddressInput, type?: AddressTypeEnum) => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'accountAddressUpdate'>,
			MutationAccountAddressUpdateArgs
		>(ACCOUNT_ADDRESS_UPDATE_MUTATION, {
			id: addressUpdateInputInitValue?.id!,
			input
		}).toPromise();

		loading = false; //

		if (preHandleErrorOnGraphqlResult(result, 'accountAddressUpdate')) return;

		const { id } = addressUpdateInputInitValue!;

		// hide update form
		addressUpdateInputInitValue = undefined;
		toastStore.send({
			variant: 'success',
			message: 'Address updated'
		});

		// update user state
		$userStore = {
			...$userStore,
			addresses: $userStore?.addresses.map((addr) => {
				if (addr.id !== id) return addr;

				return {
					...addr,
					...result.data?.accountAddressUpdate?.address
				};
			})
		} as User;
	};

	const handleCreateAddress = async (input: AddressInput, type?: AddressTypeEnum) => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'accountAddressCreate'>,
			MutationAccountAddressCreateArgs
		>(ACCOUNT_ADDRESS_CREATE_MUTATION, {
			input,
			type
		}).toPromise();

		loading = false; //

		if (preHandleErrorOnGraphqlResult(result, 'accountAddressCreate')) return;

		toastStore.send({
			variant: 'success',
			message: 'Address created'
		});
		$userStore = {
			...$userStore,
			addresses: ($userStore?.addresses || []).concat(
				result.data?.accountAddressCreate?.address as Address
			)
		} as User;
		showAddressCreateForm = false;
	};

	const handleDeleteAddress = async (id: string) => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'accountAddressDelete'>,
			MutationAccountAddressDeleteArgs
		>(ACCOUNT_ADDRESS_DELETE_MUTATION, {
			id
		}).toPromise();

		loading = false; //

		if (preHandleErrorOnGraphqlResult(result, 'accountAddressDelete')) return;
		toastStore.send({
			variant: 'success',
			message: 'Address deleted'
		});

		$userStore = {
			...$userStore,
			addresses: ($userStore?.addresses || []).filter((address) => address.id !== id)
		} as User;
	};
</script>

<div class="rounded-lg bg-white p-4 border border-gray-200 mt-2">
	<Label label="Manage Addresses" size="lg" />

	<div class="mt-2">
		{#if !$userStore?.addresses?.length}
			<div class="text-sm">You have no address yet</div>
		{:else}
			<div class="flex gap-2 flex-wrap">
				{#each $userStore?.addresses as address, idx (idx)}
					<UserAddress {address} class="w-[48%] mobile-l:w-full">
						<div class="text-right flex gap-2 justify-end">
							<Button
								size="xs"
								variant="light"
								startIcon={Edit}
								disabled={loading}
								onclick={() => handleShowAddressForm(false, address)}>Edit</Button
							>
							<Button
								size="xs"
								color="red"
								variant="light"
								startIcon={Trash}
								onclick={() =>
									ALERT_MODAL_STORE.openAlertModal({
										content: 'Are you sure you want to delete this address?',
										onOk: () => handleDeleteAddress(address.id)
									})}
								disabled={loading}>Delete</Button
							>
						</div>
					</UserAddress>
				{/each}
			</div>
		{/if}
		{#if !showAddressCreateForm && !addressUpdateInputInitValue}
			<div class="mt-2 text-right">
				<Button size="xs" onclick={() => handleShowAddressForm(true)} startIcon={Plus}
					>New Address</Button
				>
			</div>
		{/if}
	</div>

	{#if showAddressCreateForm}
		<div class="mt-3">
			<AddressForm
				onSubmit={handleCreateAddress}
				onCancel={() => (showAddressCreateForm = false)}
				updatingCHeckoutAddresses={loading}
				channelSlug={clientSideGetCookieOrDefault(CHANNEL_KEY, DEFAULT_CHANNEL.slug)}
				showSetAsDefaultAddressField
				defaultValue={undefined}
			/>
		</div>
	{/if}

	{#if addressUpdateInputInitValue}
		<div class="mt-3">
			<AddressForm
				onSubmit={handleUpdateAddress}
				onCancel={() => (addressUpdateInputInitValue = undefined)}
				updatingCHeckoutAddresses={loading}
				channelSlug={clientSideGetCookieOrDefault(CHANNEL_KEY, DEFAULT_CHANNEL.slug)}
				defaultValue={addressUpdateInputInitValue}
			/>
		</div>
	{/if}
</div>
