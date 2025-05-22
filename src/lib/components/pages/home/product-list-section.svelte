<script lang="ts">
	import ProductFilterStateListener from './product-filter-state-listener.svelte';
	import { productFilterParamStore } from '$lib/stores/app/product-filter.svelte';
	import ProductListPage from './product-list-page.svelte';
	import { onMount, tick } from 'svelte';
	import { Modal } from '$lib/components/ui/Modal';
	import { pushState, replaceState } from '$app/navigation';
	import ProductPreview from './product-preview.svelte';
	import { PRODUCT_PREVIEW_STORE } from './common';
	import { tranFunc } from '$i18n';

	let productLoadPageVariables = $state.raw([$productFilterParamStore]);

	$effect(() => {
		if (!$productFilterParamStore.reload) return;

		productLoadPageVariables = [];
		tick().then(() => {
			productFilterParamStore.set({
				...$productFilterParamStore,
				reload: false,
			});
			productLoadPageVariables = [$productFilterParamStore];
		});
	});

	const handleLoadMore = (afterCursor: string) => {
		productLoadPageVariables = productLoadPageVariables.concat({
			...$productFilterParamStore,
			after: afterCursor,
		});
	};

	onMount(() => {
		const unsub = PRODUCT_PREVIEW_STORE.subscribe((product) => {
			if (product) {
				pushState('', { productPreview: product });
			}
		});

		return unsub;
	});

	const handleCloseModal = () => {
		replaceState('', { productPreview: null });
		PRODUCT_PREVIEW_STORE.set(null);
	};
</script>

<!-- url search params listener -->
<ProductFilterStateListener />

<div>
	{#each productLoadPageVariables as variables, idx (idx)}
		<ProductListPage
			{variables}
			isLastPage={idx === productLoadPageVariables.length - 1}
			onLoadMore={handleLoadMore}
		/>
	{/each}
</div>

<Modal
	open={!!$PRODUCT_PREVIEW_STORE}
	header={$PRODUCT_PREVIEW_STORE?.name || ''}
	onClose={handleCloseModal}
	onCancel={handleCloseModal}
	closeOnOutsideClick
	size="sm"
	hideHeader
	cancelText={$tranFunc('common.cancel')}
	okText={$tranFunc('product.detail')}
>
	{#if $PRODUCT_PREVIEW_STORE}
		<ProductPreview productSlug={$PRODUCT_PREVIEW_STORE.slug} />
	{/if}
</Modal>
