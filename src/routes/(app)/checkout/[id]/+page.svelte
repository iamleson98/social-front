<script lang="ts">
	import { CheckoutLayout } from '$lib/components/pages/checkout';
	import { afterNavigate } from '$app/navigation';
	import { CheckoutSteps } from '$lib/components/common/checkout-steps';
	import { onMount } from 'svelte';
	import { checkoutStore } from '$lib/stores/app';
	import { page } from '$app/state';
	import { operationStore } from '$lib/stores/api/operation';
	import { CHECKOUT_DETAILS_QUERY } from '$lib/stores/api/checkout';
	import type { Checkout, Query, QueryCheckoutArgs } from '$lib/gql/graphql';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';

	afterNavigate(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	});

	const checkoutQueryStore = operationStore<Pick<Query, 'checkout'>, QueryCheckoutArgs>({
		kind: 'query',
		query: CHECKOUT_DETAILS_QUERY,
		variables: {
			id: page.params.id
		}
	});

	onMount(() => {
		const unsub = checkoutQueryStore.subscribe((result) => {
			if (preHandleErrorOnGraphqlResult(result)) return;

			checkoutStore.set(result.data?.checkout as Checkout);
		});

		return unsub;
	});
</script>

<div>
	{#if $checkoutQueryStore.fetching}
		<div>Loading...</div>
	{:else if !$checkoutQueryStore.data?.checkout}
		<CheckoutSteps numberOfItemToEnable={2} />
		<CheckoutLayout />
	{/if}
</div>
