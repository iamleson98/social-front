<script lang="ts">
	import { CheckoutSteps } from '$lib/components/common/checkout-steps';
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { CHECKOUT_DETAILS_QUERY } from '$lib/api/checkout';
	import type { Query, QueryCheckoutArgs } from '$lib/gql/graphql';
	import CheckoutForm from '$lib/components/pages/checkout/checkout-form.svelte';
	import CheckoutSummary from '$lib/components/pages/checkout/checkout-summary.svelte';
	import { Alert } from '$lib/components/ui/Alert';

	const checkoutQueryStore = operationStore<Pick<Query, 'checkout'>, QueryCheckoutArgs>({
		query: CHECKOUT_DETAILS_QUERY,
		variables: {
			id: page.params.id,
		},
	});
</script>

<div>
	{#if $checkoutQueryStore.fetching}
		<div>Loading...</div>
	{:else if $checkoutQueryStore.error}
		<Alert variant="error" size="sm" bordered>{$checkoutQueryStore.error.message}</Alert>
	{:else if $checkoutQueryStore.data?.checkout}
		<CheckoutSteps numberOfItemToEnable={2} />
		<div class="flex flex-row gap-2 flex-nowrap tablet:flex-wrap tablet:flex-row-reverse">
			<CheckoutForm checkout={$checkoutQueryStore.data.checkout} />
			<CheckoutSummary checkout={$checkoutQueryStore.data.checkout} />
		</div>
	{/if}
</div>
