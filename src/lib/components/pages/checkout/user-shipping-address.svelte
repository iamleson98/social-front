<script lang="ts">
	import type { Checkout, CountryCode, Query, QueryChannelArgs } from '$lib/gql/graphql';
	import { operationStore } from '$lib/api/operation';
	import { CHANNEL_DETAILS_QUERY_STORE } from '$lib/api/channels';
	import AddressCreateForm from './address-create-form.svelte';
	import AddressEditForm from './address-edit-form.svelte';
	import AddressList from './address-list.svelte';
	import { Alert } from '$lib/components/ui/Alert';

	type Props = {
		checkout: Checkout;
	};

	let { checkout }: Props = $props();

	let displayAddressCreate = $state(false);
	let editedAddressId = $state<string>();
	let displayAddressEdit = $derived(!!editedAddressId);
	let displayAddressList = $derived.by(() => !displayAddressCreate && !displayAddressEdit);

	const channelStore = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: {
			slug: checkout.channel.slug,
		},
	});
</script>

{#if $channelStore.fetching}
	<div>Loading..</div>
{:else if $channelStore.error}
	<Alert variant="error" size="sm" bordered>{$channelStore.error.message}</Alert>
{:else}
	{@const availableCountries =
		$channelStore.data?.channel?.countries?.map(({ code }) => code as CountryCode) || []}
	{#if displayAddressCreate}
		<AddressCreateForm
			{checkout}
			{availableCountries}
			onCancel={() => (displayAddressCreate = false)}
		/>
	{:else if displayAddressEdit}
		<AddressEditForm />
	{:else if displayAddressList}
		<AddressList
			onEditChange={(addrId) => (editedAddressId = addrId)}
			onAddAddressClick={() => (displayAddressCreate = true)}
		/>
	{/if}
{/if}
