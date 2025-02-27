<script lang="ts">
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Label } from '$lib/components/ui/Input';
	import { userStore } from '$lib/stores/auth';
	import { noop } from 'es-toolkit';
	import AddressForm from '../checkout/address-form.svelte';
	import type {
		Address,
		AddressInput,
		Mutation,
		MutationAddressCreateArgs,
		MutationAddressDeleteArgs,
		User
	} from '$lib/gql/graphql';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { CHANNEL_KEY } from '$lib/utils/consts';
	import { DEFAULT_CHANNEL } from '$lib/utils/channels';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { ADDRESS_CREATE_MUTATION, ADDRESS_DELETE_MUTATION } from '$lib/api/account';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { toastStore } from '$lib/stores/ui/toast';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';

	let showAddressCreateForm = $state(false);
	let loading = $state(false);

	const addNewAddress = () => {
		showAddressCreateForm = true;
	};

	const handleCreateAddress = async (input: AddressInput) => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'addressCreate'>,
			MutationAddressCreateArgs
		>(ADDRESS_CREATE_MUTATION, {
			userId: $userStore?.id as string,
			input
		}).toPromise();

		loading = false; //
		if (preHandleErrorOnGraphqlResult(result)) return;
		if (result.data?.addressCreate?.errors.length) {
			toastStore.send({
				variant: 'error',
				message: result.data?.addressCreate?.errors[0]?.message as string
			});
			return;
		}
		toastStore.send({
			variant: 'success',
			message: 'Address created'
		});
		$userStore = {
			...$userStore,
			addresses: ($userStore?.addresses || []).concat(
				result.data?.addressCreate?.address as Address
			)
		} as User;
		showAddressCreateForm = false;
	};

	const handleDeleteAddress = async (id: string) => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'addressDelete'>,
			MutationAddressDeleteArgs
		>(ADDRESS_DELETE_MUTATION, {
			id
		}).toPromise();

		loading = false; //

		if (preHandleErrorOnGraphqlResult(result)) return;
		if (result.data?.addressDelete?.errors.length) {
			toastStore.send({
				variant: 'error',
				message: result.data?.addressDelete?.errors[0]?.message as string
			});
			return;
		}

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
		{#if $userStore?.addresses.length}
			<div class="flex gap-2 mobile-l:flex-wrap">
				{#each $userStore?.addresses as address, idx (idx)}
					<UserAddress {address} class="w-1/2 mobile-l:w-full">
						<div class="text-right flex gap-2 justify-end">
							<Button size="xs" variant="light" startIcon={Edit} disabled={loading}>Edit</Button>
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
		{:else}
			<div class="text-sm">You have no address yet</div>
		{/if}
		{#if !showAddressCreateForm}
			<div class="mt-2 text-right">
				<Button size="xs" onclick={addNewAddress} startIcon={Plus}>New Address</Button>
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
			/>
		</div>
	{/if}
</div>
