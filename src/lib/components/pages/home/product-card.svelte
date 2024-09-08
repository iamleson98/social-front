<script lang="ts">
	import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
	import { Heart, Icon, OpenEye, ShoppingBagPlus } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Progress } from '$lib/components/ui/Progress';
	import { AppRoute } from '$lib/utils';
	import { MAX_RATING } from '$lib/utils/consts';
	import { parseProductDescription } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	type ProductProps = {
		name: string;
		categoryName: string;
		description: string;
		thumbnailUrl: string;
		price?: number;
		thumbnailAlt?: string | null;
		slug: string;
		rating?: number | null;
	};

	let {
		name,
		categoryName,
		thumbnailUrl,
		thumbnailAlt,
		slug,
		rating = 0,
		description
	}: ProductProps = $props();

	let processingDescription = $state(true);
	let productDescriptionBlocks = $state.frozen<string[]>([]);

	onMount(async () => {
		productDescriptionBlocks = parseProductDescription(description);
		processingDescription = false;
	});
</script>

<div class="bg-white rounded-lg border mb-3" transition:fade>
	<div class="product-card-picture relative">
		<div class="px-5">
			<a href={`${AppRoute.PRODUCTS}/${encodeURIComponent(slug)}`}>
				<img src={thumbnailUrl} alt={thumbnailAlt} class="select-none" loading="lazy" />
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
			<Badge color="orange" variant="light" text={categoryName} />
			<div class="text-xs flex items-center text-red-600 gap-1">
				{#if rating}
					<div>{rating > MAX_RATING ? MAX_RATING : rating} / {MAX_RATING}</div>
				{:else}
					<div>No vote yet</div>
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
			<a href={`${AppRoute.PRODUCTS}/${encodeURI(slug)}`}>see more...</a>
		</div>
		<Button variant="outline" startIcon={OpenEye} size="sm" fullWidth class="mb-1">Preview</Button>
		<Button variant="filled" startIcon={ShoppingBagPlus} size="sm" fullWidth>Add to cart</Button>
		<!-- <div class="text-xs text-gray-500 flex items-center gap-1">
			<Icon icon={TruckDelivery} />
			<p>
				Estimated Delivery <span class="font-semibold text-gray-600">Jun 23 - Jun 24</span>
			</p>
		</div> -->
	</div>
</div>
