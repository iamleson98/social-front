<script lang="ts">
	import { CheckoutLayout } from '$lib/components/pages/checkout';
	import { afterNavigate } from '$app/navigation';
	import { CheckoutSteps } from '$lib/components/common/checkout-steps';
	import { onMount } from 'svelte';
	import { checkoutStore } from '$lib/stores/app';
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { CHECKOUT_DETAILS_QUERY } from '$lib/api/checkout';
	import type { Checkout, Query, QueryCheckoutArgs } from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	afterNavigate(() => {
		scrollTo({ top: 0, behavior: 'smooth' });
	});

	const checkoutQueryStore = operationStore<Pick<Query, 'checkout'>, QueryCheckoutArgs>({
		kind: 'query',
		query: CHECKOUT_DETAILS_QUERY,
		variables: {
			id: page.params.id
		}
	});

	onMount(() => {
		return checkoutQueryStore.subscribe((result) => {
			if (checkIfGraphqlResultHasError(result)) return;

			checkoutStore.set(result.data?.checkout as Checkout);
		});
	});
</script>

<div>
	{#if $checkoutQueryStore.fetching}
		<div>Loading...</div>
	{:else if $checkoutQueryStore.data?.checkout}
		<CheckoutSteps numberOfItemToEnable={2} />
		<CheckoutLayout />
	{/if}
</div>
