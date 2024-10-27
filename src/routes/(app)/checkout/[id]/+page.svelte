<script lang="ts">
	import { page } from '$app/stores';
	import { CheckoutLayout } from '$lib/components/pages/checkout';
	import { TimeLine } from '$lib/components/ui/timeline';
	import type { Checkout, Query } from '$lib/gql/graphql';
	import { operationStore } from '$lib/stores/api/operation';
	import { CHECKOUT_DETAILS_QUERY } from '$lib/stores/api/checkout';
	import { type CustomQueryCheckoutArgs } from '$lib/utils/types';
	import { afterNavigate } from '$app/navigation';

	const checkoutStore = operationStore<Pick<Query, 'checkout'>, CustomQueryCheckoutArgs>({
		kind: 'query',
		query: CHECKOUT_DETAILS_QUERY,
		variables: {
			id: $page.params.id
		},
		context: { requestPolicy: 'network-only' }
	});

	afterNavigate(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	});
</script>

<div>
	{#if $checkoutStore.fetching}
		<div>Loading...</div>
	{:else if $checkoutStore.error}
		<div>{$checkoutStore.error.message}</div>
	{:else}
		<TimeLine
			items={[
				{ title: 'Shopping cart', done: true },
				{ title: 'Checkout', done: true },
				{ title: 'Payment', done: false },
				{ title: 'Order confirmation', done: false }
			]}
			class="py-3 px-2"
		/>
		<CheckoutLayout checkout={$checkoutStore.data?.checkout as Checkout} />
	{/if}
</div>
