<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Heart, OpenEye } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { AppRoute } from '$lib/utils';
	import { MAX_RATING, MIN_RATING } from '$lib/utils/consts';
	import { clamp, formatMoney } from '$lib/utils/utils';
	import { fade } from 'svelte/transition';
	import type { Product } from '$lib/gql/graphql';
	import FoundationBurstSale from '$lib/components/icons/foundation-burst-sale.svelte';
	import { CHANNELS } from '$lib/utils/channels';
	import { PRODUCT_PREVIEW_STORE } from '../../pages/home/common';

	type ProductProps = {
		product: Product;
	};

	let { product }: ProductProps = $props();
	const { name, category, slug, rating, thumbnail, pricing } = product;

	// shallow routing to display product preview modal
	const handlePreviewProduct = () => {
		PRODUCT_PREVIEW_STORE.set(product);
	};
</script>

<div class="bg-white rounded-lg border overflow-hidden" transition:fade>
	<div class="product-card-picture relative">
		<a href={`${AppRoute.PRODUCT_DETAILS(product.slug)}`}>
			<div
				class="pt-[100%] bg-cover bg-center bg-no-repeat"
				style="background-image: url('{thumbnail?.url}');"
			></div>
		</a>

		<div class="absolute top-0 right-0 p-2">
			<IconButton icon={Heart} variant="light" size="sm" />
		</div>

		{#if pricing?.onSale}
			<Badge
				color="red"
				variant="filled"
				startIcon={FoundationBurstSale}
				text="Sale"
				class="absolute top-4 left-2"
			/>
		{/if}
	</div>

	<div class="px-6 py-2">
		<!-- name -->
		<a
			href={`${AppRoute.PRODUCT_DETAILS(product.slug)}`}
			class="font-semibold text-base text-gray-700 leading-5 hover:underline mb-3 block">{name}</a
		>

		<!-- category and voting -->
		<div class="mb-3 flex items-center justify-between">
			<Badge color="violet" variant="filled" text={(category?.name || category?.id) as string} />
			<div class="text-xs flex items-center text-red-600 gap-1 font-semibold">
				<div class="text-nowrap">
					{rating
						? `${clamp(rating, MIN_RATING, MAX_RATING)} / ${MAX_RATING}`
						: $tranFunc('product.noVote')}
				</div>
				<progress
					class="progress progress-warning min-w-24"
					max="100"
					value={((rating as number) / MAX_RATING) * 100}
				></progress>
			</div>
		</div>

		<!-- price -->
		<div class="flex items-end flex-row gap-2 mb-2">
			<p class="text-xs font-normal text-gray-500">{$tranFunc('common.startAt')}</p>
			<p class="font-bold text-blue-700 text-xl underline">
				{formatMoney(
					pricing?.priceRange?.start?.gross.currency ||
						CHANNELS.find((chan) => chan.slug === product.channel)?.currency ||
						'',
					pricing?.priceRange?.start?.gross.amount || 0
				)}
			</p>
		</div>

		<Button startIcon={OpenEye} variant="light" size="sm" fullWidth onclick={handlePreviewProduct}
			>Preview</Button
		>
	</div>
</div>
