<script lang="ts">
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Label } from '$lib/components/ui/Input';
	import AddressForm from '$lib/components/pages/checkout/address-form.svelte';
	import type {
		Address,
		AddressInput,
		Mutation,
		MutationAccountAddressCreateArgs,
		MutationAccountAddressDeleteArgs,
		MutationAccountAddressUpdateArgs,
		MutationAccountSetDefaultAddressArgs,
		User
	} from '$lib/gql/graphql';
	import { AddressTypeEnum } from '$lib/gql/graphql';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { CHANNEL_KEY } from '$lib/utils/consts';
	import { DEFAULT_CHANNEL } from '$lib/utils/channels';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import {
		ACCOUNT_ADDRESS_CREATE_MUTATION,
		ACCOUNT_ADDRESS_DELETE_MUTATION,
		ACCOUNT_ADDRESS_UPDATE_MUTATION,
		ACCOUNT_SET_DEFAULT_ADDRESS_MUTATION
	} from '$lib/api/account';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { ME_PAGE_USER_STORE } from '$lib/stores/app/me';
	import { tranFunc } from '$i18n';

	let showAddressCreateForm = $state(false);
	let loading = $state(false);
	let addressUpdateInputInitValue = $state<Address>();
	const MAX_USER_ADDRESSES = 5;

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

		if (
			checkIfGraphqlResultHasError(
				result,
				'accountAddressUpdate',
				$tranFunc('settings.addrUpdated')
			)
		)
			return;

		// hide update form
		addressUpdateInputInitValue = undefined;

		// update user state
		$ME_PAGE_USER_STORE = {
			...$ME_PAGE_USER_STORE,
			addresses: result.data?.accountAddressUpdate?.user?.addresses || []
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

		if (
			checkIfGraphqlResultHasError(
				result,
				'accountAddressCreate',
				$tranFunc('settings.addrCreated')
			)
		)
			return;

		$ME_PAGE_USER_STORE = {
			...$ME_PAGE_USER_STORE,
			addresses: result.data?.accountAddressCreate?.user?.addresses || []
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

		if (
			checkIfGraphqlResultHasError(
				result,
				'accountAddressDelete',
				$tranFunc('settings.addrDeleted')
			)
		)
			return;

		$ME_PAGE_USER_STORE = {
			...$ME_PAGE_USER_STORE,
			addresses: ($ME_PAGE_USER_STORE?.addresses || []).filter((address) => address.id !== id)
		} as User;
	};

	const setDefaultAddress = async (id: string, type: AddressTypeEnum) => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'accountSetDefaultAddress'>,
			MutationAccountSetDefaultAddressArgs
		>(ACCOUNT_SET_DEFAULT_ADDRESS_MUTATION, {
			id,
			type
		});

		loading = false; //

		if (
			checkIfGraphqlResultHasError(
				result,
				'accountSetDefaultAddress',
				$tranFunc('settings.addrUpdated')
			)
		)
			return;

		$ME_PAGE_USER_STORE = {
			...$ME_PAGE_USER_STORE,
			addresses: result.data?.accountSetDefaultAddress?.user?.addresses || []
		} as User;
	};
</script>

<div class="rounded-lg bg-white p-4 border border-gray-200 mt-2">
	<Label label={$tranFunc('settings.addrManage')} size="lg" />

	<div class="mt-2">
		{#if !$ME_PAGE_USER_STORE?.addresses?.length}
			<div class="text-sm">{$tranFunc('settings.havingNoAddress')}</div>
		{:else}
			<div class="flex gap-2 flex-wrap">
				{#each $ME_PAGE_USER_STORE?.addresses as address, idx (idx)}
					<UserAddress {address} class="w-[49%] mobile-l:w-full">
						<div class="flex items-center gap-2 text-gray-600!">
							{#if !address.isDefaultBillingAddress}
								<Checkbox
									label={$tranFunc('settings.makeDefaultBillingAddr')}
									onchange={() => setDefaultAddress(address.id, AddressTypeEnum.Billing)}
									size="sm"
									disabled={loading}
								/>
							{/if}
							{#if !address.isDefaultShippingAddress}
								<Checkbox
									label={$tranFunc('settings.makeDefaultShippingAddr')}
									onchange={() => setDefaultAddress(address.id, AddressTypeEnum.Shipping)}
									size="sm"
									disabled={loading}
								/>
							{/if}
						</div>
						<div class="text-right flex gap-2 justify-end mt-2">
							<Button
								size="xs"
								color="red"
								variant="light"
								startIcon={Trash}
								onclick={() =>
									ALERT_MODAL_STORE.openAlertModal({
										content: $tranFunc('settings.confirmDelAddr'),
										onOk: () => handleDeleteAddress(address.id)
									})}
								disabled={loading}>{$tranFunc('btn.delete')}</Button
							>
							<Button
								size="xs"
								variant="light"
								startIcon={Edit}
								disabled={loading}
								onclick={() => handleShowAddressForm(false, address)}
								>{$tranFunc('btn.update')}</Button
							>
						</div>
					</UserAddress>
				{/each}
			</div>
		{/if}
		{#if !showAddressCreateForm && !addressUpdateInputInitValue && ($ME_PAGE_USER_STORE?.addresses?.length || 0) < MAX_USER_ADDRESSES}
			<div class="mt-2 text-right">
				<Button size="xs" onclick={() => handleShowAddressForm(true)} startIcon={Plus}>
					{$tranFunc('settings.newAddr')}
				</Button>
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
