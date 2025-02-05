<script lang="ts">
	import type { CountryCode, Query, QueryChannelArgs } from '$lib/gql/graphql';
	import { operationStore } from '$lib/api/operation';
	import { CHANNEL_DETAILS_QUERY_STORE } from '$lib/api/channels';
	import AddressCreateForm from './address-create-form.svelte';
	import AddressEditForm from './address-edit-form.svelte';
	import AddressList from './address-list.svelte';
	import { checkoutStore } from '$lib/stores/app';

	let displayAddressCreate = $state(false);
	let editedAddressId = $state<string>();
	let displayAddressEdit = $derived(!!editedAddressId);
	let displayAddressList = $derived.by(() => !displayAddressCreate && !displayAddressEdit);

	const channelStore = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: {
			slug: $checkoutStore?.channel.slug
		},
		pause: !$checkoutStore?.channel.slug
	});
</script>

{#if $channelStore.fetching}
	<div>Loading...</div>
{:else if $channelStore.error}
	<div>{$channelStore.error.message}</div>
{:else}
	{@const availableCountries =
		$channelStore.data?.channel?.countries?.map(({ code }) => code as CountryCode) || []}
	{#if displayAddressCreate}
		<AddressCreateForm {availableCountries} onCancel={() => (displayAddressCreate = false)} />
	{:else if displayAddressEdit}
		<AddressEditForm />
	{:else if displayAddressList}
		<AddressList
			onEditChange={(addrId) => (editedAddressId = addrId)}
			onAddAddressClick={() => (displayAddressCreate = true)}
		/>
	{/if}
{/if}
