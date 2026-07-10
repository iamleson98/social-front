<script lang="ts">
	import { T } from '$i18n';
	import {
		ACCOUNT_ADDRESS_CREATE_MUTATION,
		ACCOUNT_ADDRESS_DELETE_MUTATION,
		ACCOUNT_ADDRESS_UPDATE_MUTATION,
		ACCOUNT_SET_DEFAULT_ADDRESS_MUTATION,
	} from '$lib/api/account';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import AddressForm from '$lib/components/pages/checkout/address-form.svelte';
	import { Button } from '$lib/components/ui';
	import { Checkbox } from '$lib/components/ui/Input';
	import type {
		Address,
		AddressInput,
		Mutation,
		MutationAccountAddressCreateArgs,
		MutationAccountAddressDeleteArgs,
		MutationAccountAddressUpdateArgs,
		MutationAccountSetDefaultAddressArgs,
		User,
	} from '$lib/gql/graphql';
	import { AddressTypeEnum } from '$lib/gql/graphql';
	import { ME_PAGE_USER_STORE } from '$lib/stores/app/me';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { DEFAULT_CHANNEL } from '$lib/utils/consts';
	import { CHANNEL_KEY } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';

	let showAddressCreateForm = $state(false);
	let loading = $state(false);
	let addressUpdateInputInitValue = $state<Address>();
	const MAX_USER_ADDRESSES = 5;

	const handleShowAddressForm = (showCreateForm: boolean, defaultAddress?: Address) => {
		showAddressCreateForm = showCreateForm;
		addressUpdateInputInitValue = defaultAddress;
	};

	const handleUpdateAddress = async (input: AddressInput, _type?: AddressTypeEnum) => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'accountAddressUpdate'>,
			MutationAccountAddressUpdateArgs
		>(ACCOUNT_ADDRESS_UPDATE_MUTATION, {
			id: addressUpdateInputInitValue?.id!,
			input,
		});

		loading = false; //

		if (
			checkIfGraphqlResultHasError(
				result,
				'accountAddressUpdate',
				$T('settings.addrUpdated'),
			)
		)
			return;

		// hide update form
		addressUpdateInputInitValue = undefined;

		// update user state
		$ME_PAGE_USER_STORE = {
			...$ME_PAGE_USER_STORE,
			addresses: result.data?.accountAddressUpdate?.user?.addresses || [],
		} as User;
	};

	const handleCreateAddress = async (input: AddressInput, type?: AddressTypeEnum) => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'accountAddressCreate'>,
			MutationAccountAddressCreateArgs
		>(ACCOUNT_ADDRESS_CREATE_MUTATION, {
			input,
			type,
		});

		loading = false; //

		if (
			checkIfGraphqlResultHasError(
				result,
				'accountAddressCreate',
				$T('settings.addrCreated'),
			)
		)
			return;

		$ME_PAGE_USER_STORE = {
			...$ME_PAGE_USER_STORE,
			addresses: result.data?.accountAddressCreate?.user?.addresses || [],
		} as User;
		showAddressCreateForm = false;
	};

	const handleDeleteAddress = async (id: string) => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'accountAddressDelete'>,
			MutationAccountAddressDeleteArgs
		>(ACCOUNT_ADDRESS_DELETE_MUTATION, {
			id,
		});

		loading = false; //

		if (
			checkIfGraphqlResultHasError(
				result,
				'accountAddressDelete',
				$T('settings.addrDeleted'),
			)
		)
			return;

		$ME_PAGE_USER_STORE = {
			...$ME_PAGE_USER_STORE,
			addresses: ($ME_PAGE_USER_STORE?.addresses || []).filter((address) => address.id !== id),
		} as User;
	};

	const setDefaultAddress = async (id: string, type: AddressTypeEnum) => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'accountSetDefaultAddress'>,
			MutationAccountSetDefaultAddressArgs
		>(ACCOUNT_SET_DEFAULT_ADDRESS_MUTATION, {
			id,
			type,
		});

		loading = false; //

		if (
			checkIfGraphqlResultHasError(
				result,
				'accountSetDefaultAddress',
				$T('settings.addrUpdated'),
			)
		)
			return;

		$ME_PAGE_USER_STORE = {
			...$ME_PAGE_USER_STORE,
			addresses: result.data?.accountSetDefaultAddress?.user?.addresses || [],
		} as User;
	};
</script>

<div class="{SitenameCommonClassName} mt-2">
	<SectionHeader>{$T('settings.addrManage')}</SectionHeader>

	<div class="mt-2">
		{#if !$ME_PAGE_USER_STORE?.addresses?.length}
			<div class="text-sm">{$T('settings.havingNoAddress')}</div>
		{:else}
			<div class="flex gap-2 flex-wrap">
				{#each $ME_PAGE_USER_STORE?.addresses as address, idx (idx)}
					<UserAddress {address} class="w-[49%] max-mobile-l:w-full">
						<div class="flex items-center gap-2 text-gray-600!">
							{#if !address.isDefaultBillingAddress}
								<Checkbox
									label={$T('settings.makeDefaultBillingAddr')}
									onchange={() => setDefaultAddress(address.id, AddressTypeEnum.Billing)}
									size="sm"
									disabled={loading}
								/>
							{/if}
							{#if !address.isDefaultShippingAddress}
								<Checkbox
									label={$T('settings.makeDefaultShippingAddr')}
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
										content: $T('settings.confirmDelAddr'),
										onOk: () => handleDeleteAddress(address.id),
									})}
								disabled={loading}>{$T('btn.delete')}</Button
							>
							<Button
								size="xs"
								variant="light"
								startIcon={Edit}
								disabled={loading}
								onclick={() => handleShowAddressForm(false, address)}
								>{$T('btn.update')}</Button
							>
						</div>
					</UserAddress>
				{/each}
			</div>
		{/if}
		{#if !showAddressCreateForm && !addressUpdateInputInitValue && ($ME_PAGE_USER_STORE?.addresses?.length || 0) < MAX_USER_ADDRESSES}
			<div class="mt-2 text-right">
				<Button size="xs" onclick={() => handleShowAddressForm(true)} startIcon={Plus}>
					{$T('settings.newAddr')}
				</Button>
			</div>
		{/if}
	</div>

	{#if showAddressCreateForm}
		<div class="mt-3">
			<AddressForm
				onSubmit={handleCreateAddress}
				onCancel={() => (showAddressCreateForm = false)}
				updatingCheckoutAddresses={loading}
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
				updatingCheckoutAddresses={loading}
				channelSlug={clientSideGetCookieOrDefault(CHANNEL_KEY, DEFAULT_CHANNEL.slug)}
				defaultValue={addressUpdateInputInitValue}
			/>
		</div>
	{/if}
</div>
