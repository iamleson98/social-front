<script lang="ts">
	import { type QueryProductsArgs } from '$lib/gql/graphql';
	import ProductFilterStateListener from './product-filter-state-listener.svelte';
	import { productFilterParamStore } from '$lib/stores/app/product-filter';
	import ProductListPage from './product-list-page.svelte';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let pageVariables = $state.frozen<QueryProductsArgs[]>([get(productFilterParamStore)]);

	onMount(() => {
		const unsub = productFilterParamStore.subscribe((state) => {
			console.log('productFilterParamStore', state);
			pageVariables = [state];
		});

		return unsub;
	});

	const handleLoadMore = (cursor: string) => {
		pageVariables = pageVariables.concat({
			...get(productFilterParamStore),
			after: cursor
		});
	};
</script>

<!-- plugin -->
<ProductFilterStateListener />

<div class="max-w-md m-auto">
	{#each pageVariables as variables, idx (idx)}
		<ProductListPage
			{variables}
			isLastPage={idx === pageVariables.length - 1}
			onLoadMore={handleLoadMore}
		/>
	{/each}
</div>
