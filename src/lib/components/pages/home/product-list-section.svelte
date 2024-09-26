<script lang="ts">
	import { type QueryProductsArgs } from '$lib/gql/graphql';
	import ProductFilterStateListener from './product-filter-state-listener.svelte';
	import { productFilterParamStore } from '$lib/stores/app/product-filter';
	import ProductListPage from './product-list-page.svelte';

	let pageVariables = $state.frozen<QueryProductsArgs[]>([$productFilterParamStore]);
</script>

<!-- plugin -->
<ProductFilterStateListener />

<div class="max-w-md m-auto">
	{#each pageVariables as variables, idx (idx)}
		<ProductListPage
			{variables}
			isLastPage={idx === pageVariables.length - 1}
			onLoadMore={(after) =>
				(pageVariables = pageVariables.concat({
					...$productFilterParamStore,
					after
				}))}
		/>
	{/each}
</div>
