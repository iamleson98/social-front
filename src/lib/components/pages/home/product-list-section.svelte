<script lang="ts">
	import ProductFilterStateListener from './product-filter-state-listener.svelte';
	import { productFilterParamStore } from '$lib/stores/app/product-filter';
	import ProductListPage from './product-list-page.svelte';
	import { onMount, tick } from 'svelte';
	import { Modal } from '$lib/components/ui/Modal';
	import ProductCard from './product-card.svelte';
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';

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

	onMount(() => {
		return () => {
			if (page.state.productPreview) pushState('', { productPreview: null });
		}
	})
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

<Modal
	open={page.state.productPreview}
	header={page.state.productPreview?.name || ''}
	onClose={() => pushState('', { productPreview: null })}
	onCancel={() => pushState('', { productPreview: null })}
	closeOnOutsideClick
>
	{#if page.state.productPreview}
		<ProductCard product={page.state.productPreview} />
	{/if}
</Modal>
