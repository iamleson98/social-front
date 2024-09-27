<script lang="ts">
	import { type QueryProductsArgs } from '$lib/gql/graphql';
	import ProductFilterStateListener from './product-filter-state-listener.svelte';
	import { productFilterParamStore } from '$lib/stores/app/product-filter';
	import ProductListPage from './product-list-page.svelte';
	import { onMount } from 'svelte';

	let pageVariables = $state.frozen<QueryProductsArgs[]>([$productFilterParamStore]);
	let forceReexecute = $state(false);

	onMount(() => {
		const unsub = productFilterParamStore.subscribe((state) => {
			forceReexecute = pageVariables.length > 1 ? true : false;
			pageVariables = [state];
		});

		return unsub;
	});
</script>

<!-- plugin -->
<ProductFilterStateListener />

<div class="max-w-md m-auto">
	{#each pageVariables as variables, idx (idx)}
		<ProductListPage
			{variables}
			{forceReexecute}
			isLastPage={idx === pageVariables.length - 1}
			onLoadMore={(after) =>
				(pageVariables = pageVariables.concat({
					...$productFilterParamStore,
					after
				}))}
		/>
	{/each}
</div>
