<script lang="ts">
	import { preloadData } from '$app/navigation';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Product } from '$lib/gql/graphql';
	import { slideShowManager } from '$lib/stores/ui/slideshow';
	import { HTTPStatusSuccess } from '$lib/utils/consts';
	import { onMount } from 'svelte';
	import ProductSlideShowPannel from '../products/detail/product-slide-show-pannel.svelte';

	type Props = {
		// productName: string;
		productSlug: string;
	};

	let { productSlug }: Props = $props();

	let product = $state<Product>();
	let loading = $state(true);

	onMount(async () => {
		const data: {
			type: 'loaded';
			status: number;
			data: Record<string, any>;
		} = await preloadData(`/products/${productSlug}`);

		loading = false;

		if (data.status === HTTPStatusSuccess) {
			product = data.data.product;
			slideShowManager.setMedias(product?.media || []);
		} else {
		}
	});
</script>

<div>
	{#if loading}
		<SkeletonContainer>
			<Skeleton class="w-full h-96" rounded={false} />
		</SkeletonContainer>
	{:else if product}
		<ProductSlideShowPannel />
	{/if}
</div>
