<script lang="ts">
	import { page } from '$app/stores';
	import { CheckoutLayout } from '$lib/components/pages/checkout';
	import type { Checkout, Query } from '$lib/gql/graphql';
	import { CHECKOUT_DETAILS_QUERY } from '$lib/stores/api/checkout';
	import { type CustomQueryCheckoutArgs } from '$lib/utils/types';
	import { afterNavigate } from '$app/navigation';
	import { CommonTimeLine } from '$lib/components/common/timeline';
	import { onMount } from 'svelte';
	import { graphqlClient } from '$lib/client';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { checkoutStore } from '$lib/stores/app';

	let loading = $state(true);

	afterNavigate(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	});

	onMount(async () => {
		const checkoutResult = await graphqlClient
			.query<Pick<Query, 'checkout'>, CustomQueryCheckoutArgs>(
				CHECKOUT_DETAILS_QUERY,
				{
					id: $page.params.id
				},
				{ requestPolicy: 'network-only' }
			)
			.toPromise();

		loading = false; //

		if (preHandleGraphqlResult(checkoutResult)) return;
		checkoutStore.set(checkoutResult.data?.checkout as Checkout);
	});
</script>

<div>
	{#if loading}
		<div>Loading...</div>
	{:else}
		<CommonTimeLine numberOfItemToEnable={2} />
		<CheckoutLayout />
	{/if}
</div>
