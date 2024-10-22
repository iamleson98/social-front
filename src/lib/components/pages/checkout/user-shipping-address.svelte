<script lang="ts">
	import type { Checkout, CountryCode, Query, QueryChannelArgs } from '$lib/gql/graphql';
	import { operationStore } from '$lib/stores/api';
	import { CHANNEL_DETAILS_QUERY_STORE } from '$lib/stores/api/channels';
	import { onMount } from 'svelte';
	import AddressCreateForm from './address-create-form.svelte';
	import AddressEditForm from './address-edit-form.svelte';
	import AddressList from './address-list.svelte';
	import { graphqlClient } from '$lib/client';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { channel } from 'diagnostics_channel';
	// import UserAddressSectionContainer from './user-address-section-container.svelte';

	type Props = {
		checkout: Checkout;
	};

	let { checkout }: Props = $props();

	let displayAddressCreate = $state(false);
	let editedAddressId = $state<string>();
	let displayAddressEdit = $derived(!!editedAddressId);
	let displayAddressList = $derived.by(() => !displayAddressCreate && !displayAddressEdit);

	// onMount(async () => {
	// 	if (!checkout.channel.slug) return;

	// 	const channelResult = await graphqlClient
	// 		.query<Pick<Query, 'channel'>, QueryChannelArgs>(CHANNEL_DETAILS_QUERY_STORE, {
	// 			slug: checkout.channel.slug
	// 		})
	// 		.toPromise();

	// 	if (preHandleGraphqlResult(channelResult)) return;

	// });

	const channelStore = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: {
			slug: checkout.channel.slug
		},
		pause: !checkout.channel.slug
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
		<AddressCreateForm {availableCountries} />
	{/if}

	{#if displayAddressEdit}
		<AddressEditForm />
	{/if}

	{#if displayAddressList}
		<AddressList />
	{/if}
{/if}
