<script lang="ts">
	import type { Checkout } from '$lib/gql/graphql';
	import CheckoutSummary from './checkout-summary.svelte';
	import CheckoutForm from './checkout-form.svelte';

	type Props = {
		checkout: Checkout;
	};

	let { checkout }: Props = $props();
</script>

<div class="flex flex-row flex-nowrap gap-2 tablet:flex-col tablet:flex-wrap">
	<CheckoutForm {checkout} />
	<CheckoutSummary {checkout} />
</div>
