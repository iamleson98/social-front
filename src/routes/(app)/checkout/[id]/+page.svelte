<script lang="ts">
	import { page } from '$app/stores';
	import { CheckoutLayout } from '$lib/components/pages/checkout';
	import { TimeLine } from '$lib/components/ui/timeline';
	import type { Checkout, Query } from '$lib/gql/graphql';
	import { operationStore } from '$lib/stores/api';
	import { CHECKOUT_DETAILS_QUERY } from '$lib/stores/api/checkout';
	import { CHANNEL_KEY, findChannelBySlug } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { type CustomQueryCheckoutArgs } from '$lib/utils/types';

	const checkoutStore = operationStore<Pick<Query, 'checkout'>, CustomQueryCheckoutArgs>({
		kind: 'query',
		query: CHECKOUT_DETAILS_QUERY,
		variables: {
			id: $page.params.id,
			languageCode: findChannelBySlug(clientSideGetCookieOrDefault(CHANNEL_KEY)).locale
		}
	});
</script>

<div>
	<TimeLine
		items={[
			{ title: 'Shopping cart', done: true },
			{ title: 'Checkout', done: true },
			{ title: 'Payment', done: false },
			{ title: 'Order confirmation', done: false }
		]}
		class="py-4 my-1"
	/>

	{#if $checkoutStore.fetching}
		<div>Loading...</div>
	{:else if $checkoutStore.error}
		<div>{$checkoutStore.error.message}</div>
	{:else}
		<CheckoutLayout checkout={$checkoutStore.data?.checkout as Checkout} />
	{/if}
</div>
