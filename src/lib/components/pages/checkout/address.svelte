<script lang="ts">
	import type { Checkout, Query, QueryChannelArgs } from '$lib/gql/graphql';
	import { operationStore } from '$lib/stores/api';
	import { CHANNEL_DETAILS_QUERY_STORE } from '$lib/stores/api/channels';
	import { userStore } from '$lib/stores/auth';
	import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import GuestBillingAddress from './guest-billing-address.svelte';
	import GuestShippingAddress from './guest-shipping-address.svelte';
	import UserBillingAddress from './user-billing-address.svelte';
	import UserShippingAddress from './user-shipping-address.svelte';

	type Props = {
		checkout: Checkout;
	};

	let { checkout }: Props = $props();

	const channelStore = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: {
			slug: clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug)
		}
	});
</script>

<div>
	{#if $userStore}
		<UserShippingAddress {checkout} />
		<UserBillingAddress />
	{:else}
		<GuestShippingAddress />
		<GuestBillingAddress />
	{/if}
</div>
