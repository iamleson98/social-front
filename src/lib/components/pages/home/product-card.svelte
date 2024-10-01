<script lang="ts">
	import { tClient } from '$i18n';
	import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
	import { Heart, OpenEye, ShoppingBagPlus } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Progress } from '$lib/components/ui/Progress';
	import type { Product } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { MAX_RATING, MIN_RATING } from '$lib/utils/consts';
	import { clamp, parseProductDescription } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	type ProductProps = {
		product: Product;
	};

	let { product }: ProductProps = $props();
	const { name, category, slug, rating, description, thumbnail, pricing } = product;

	let processingDescription = $state(true);
	let productDescriptionBlocks = $state.frozen<string[]>([]);

	onMount(async () => {
		productDescriptionBlocks = parseProductDescription(description as string);
		processingDescription = false;
	});
</script>

<div class="bg-white rounded-lg border mb-3" transition:fade>
	<div class="product-card-picture relative">
		<div class="px-5">
			<a href={`${AppRoute.PRODUCTS}/${encodeURIComponent(slug)}`}>
				<img src={thumbnail?.url} alt={thumbnail?.alt || name} class="select-none" loading="lazy" />
			</a>
		</div>

		<div class="absolute top-0 right-0 p-2">
			<IconButton icon={Heart} variant="light" size="sm" />
		</div>
	</div>

	<div class="p-6">
		<div class="flex items-center justify-between mb-3">
			<a
				href={`${AppRoute.PRODUCTS}/${encodeURIComponent(slug)}`}
				class="font-semibold leading-5 text-lg text-gray-700 hover:underline">{name}</a
			>
			<p class="leading-5 font-extrabold text-blue-700 text-2xl">$299</p>
		</div>
		<div class="mb-2 flex items-center justify-between">
			<Badge color="orange" variant="light" text={(category?.name || category?.id) as string} />
			<div class="text-xs flex items-center text-red-600 gap-1">
				{#if rating}
					<div>{clamp(rating, MIN_RATING, MAX_RATING)} / {MAX_RATING}</div>
				{:else}
					<div>{tClient('product.noVote')}</div>
				{/if}
				<Progress percent={((rating as number) / MAX_RATING) * 100} />
			</div>
		</div>
		<div class="mb-3 text-sm">
			{#if processingDescription}
				<SkeletonContainer>
					<Skeleton class="w-40 h-2" />
					<Skeleton class="h-1 w-28" />
				</SkeletonContainer>
			{:else if productDescriptionBlocks.length}
				{@html productDescriptionBlocks[0]}
			{/if}
			<a href={`${AppRoute.PRODUCTS}/${encodeURIComponent(slug)}`}>see more...</a>
		</div>
		<Button variant="outline" startIcon={OpenEye} size="sm" fullWidth class="mb-1">Preview</Button>
		<Button variant="filled" startIcon={ShoppingBagPlus} size="sm" fullWidth>Add to cart</Button>
	</div>
</div>
