<script lang="ts">
	import { CheckoutLayout } from '$lib/components/pages/checkout';
	import { afterNavigate } from '$app/navigation';
	import { CheckoutSteps } from '$lib/components/common/checkout-steps';
	import { onMount } from 'svelte';
	import { checkoutStore } from '$lib/stores/app';
	import { AppRoute } from '$lib/utils';

	let loading = $state(true);

	afterNavigate(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	});

	onMount(async () => {
		if ($checkoutStore) {
			loading = false;
			return;
		}

		const checkoutResult = await fetch(AppRoute.CHECKOUT_GET_OR_CREATE);
		const checkoutData = await checkoutResult.json();

		loading = false;
		console.log(checkoutData);
	})
</script>

<div>
	{#if loading || !$checkoutStore}
		<div>Loading...</div>
	{:else}
		<CheckoutSteps numberOfItemToEnable={2} />
		<CheckoutLayout />
	{/if}
</div>
