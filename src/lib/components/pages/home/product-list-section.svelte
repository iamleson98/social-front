<script lang="ts">
	import ProductFilterStateListener from './product-filter-state-listener.svelte';
	import { productFilterParamStore } from '$lib/stores/app/product-filter';
	import ProductListPage from './product-list-page.svelte';
	import { tick } from 'svelte';

	let productLoadPageVariables = $state.raw([$productFilterParamStore]);

	$effect(() => {
		if (!$productFilterParamStore.reload) return;

		productLoadPageVariables = [];
		tick().then(() => {
			productFilterParamStore.set({ ...$productFilterParamStore, reload: false });
			productLoadPageVariables = [$productFilterParamStore];
		});
	});

	const handleLoadMore = (afterCursor: string) => {
		productLoadPageVariables = productLoadPageVariables.concat({
			...$productFilterParamStore,
			after: afterCursor
		});
	};
</script>

<!-- url search params listener -->
<ProductFilterStateListener />

<div class="max-w-md m-auto">
	{#each productLoadPageVariables as variables, idx (idx)}
		<ProductListPage
			{variables}
			isLastPage={idx === productLoadPageVariables.length - 1}
			onLoadMore={handleLoadMore}
		/>
	{/each}
</div>
