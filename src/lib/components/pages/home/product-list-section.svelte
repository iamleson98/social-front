<script lang="ts">
	import ProductFilterStateListener from './product-filter-state-listener.svelte';
	import {
		productFilterParamStore,
		type ProductFilterParams
	} from '$lib/stores/app/product-filter';
	import ProductListPage from './product-list-page.svelte';
	import { get } from 'svelte/store';
	import { onMount, tick } from 'svelte';

	let pageVariables = $state.frozen<ProductFilterParams[]>([get(productFilterParamStore)]);

	onMount(() => {
		const unsub = productFilterParamStore.subscribe((state) => {
			if (state.reload) {
				pageVariables = [];

				tick().then(() => {
					productFilterParamStore.update((state) => ({ ...state, reload: false }));
					pageVariables = [get(productFilterParamStore)];
				});
			}
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

<!-- url search params listener -->
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
