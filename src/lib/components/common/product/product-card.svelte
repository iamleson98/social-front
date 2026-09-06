<script lang="ts">
	import { T } from '$i18n';
	import { Discount, Heart, HeartFilled, OpenEye } from '$lib/components/icons';
	import { PRODUCT_PREVIEW_STORE } from '$lib/components/pages/home/common';
	import { Badge } from '$lib/components/ui/Badge';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import type { Product } from '$lib/gql/graphql';
	import { wishlistStore } from '$lib/stores/app/wishlist';
	import { AppRoute } from '$lib/utils';
	import { CHANNELS } from '$lib/utils/consts';
	import { MAX_RATING, MIN_RATING } from '$lib/utils/consts';
	import { formatMoney } from '$lib/utils/utils';
	import { clamp } from 'es-toolkit/compat';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';

	interface ProductProps {
		product: Product;
	}

	const { product }: ProductProps = $props();
	// the card is rendered inside keyed each blocks, so the prop is stable per instance;
	// destructuring once keeps the template readable
	// svelte-ignore state_referenced_locally
	const { name, category, slug, rating, thumbnail, pricing } = product;

	const isWishlisted = $derived($wishlistStore.includes(product.id));

	const discountPercent = $derived.by(() => {
		const start = pricing?.priceRange?.start?.gross?.amount;
		const undiscounted = pricing?.priceRangeUndiscounted?.start?.gross?.amount;
		if (!start || !undiscounted || undiscounted <= start) return 0;
		return Math.round(((undiscounted - start) / undiscounted) * 100);
	});

	const toggleWishlist = (): void => {
		const added = wishlistStore.toggle(product.id);
		toast.success(added ? $T('wishlist.added') : $T('wishlist.removed'));
	};

	// shallow routing to display product preview modal
	const handlePreviewProduct = (): void => {
		PRODUCT_PREVIEW_STORE.set(product);
	};
</script>

<article
	class="group card-surface overflow-hidden transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-gray-300 flex flex-col"
	transition:fade
>
	<div class="product-card-picture relative overflow-hidden bg-gray-50">
		<a href={AppRoute.PRODUCT_DETAILS(slug)} aria-label={name} class="block">
			<div
				class="pt-[100%] bg-cover bg-center bg-no-repeat transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transform-none"
				style="background-image: url('{thumbnail?.url}');"
				role="img"
				aria-label={thumbnail?.alt || name}
			></div>
		</a>

		<div class="absolute top-2 right-2 flex flex-col gap-1.5">
			<IconButton
				icon={isWishlisted ? HeartFilled : Heart}
				variant="light"
				size="sm"
				class={`bg-white/90! backdrop-blur-sm shadow-xs hover:bg-white! ${
					isWishlisted ? 'text-red-500!' : 'text-gray-500!'
				}`}
				aria-label={$T('wishlist.toggleAria')}
				onclick={toggleWishlist}
			/>
			<IconButton
				icon={OpenEye}
				variant="light"
				size="sm"
				class="bg-white/90! backdrop-blur-sm shadow-xs text-gray-500! hover:bg-white! max-tablet:hidden! opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
				aria-label={$T('product.quickView')}
				onclick={handlePreviewProduct}
			/>
		</div>

		{#if discountPercent > 0}
			<Badge
				color="red"
				variant="filled"
				text={`-${discountPercent}%`}
				class="absolute top-3 left-2 shadow-sm!"
			/>
		{:else if pricing?.onSale}
			<Badge
				color="red"
				variant="filled"
				startIcon={Discount}
				text={$T('product.onSale')}
				class="absolute top-3 left-2 shadow-sm!"
			/>
		{/if}
	</div>

	<div class="p-3.5 flex flex-col flex-1 gap-2.5">
		<!-- name -->
		<a
			href={AppRoute.PRODUCT_DETAILS(product.slug)}
			class="font-semibold text-[15px] text-gray-800 leading-5 line-clamp-2 hover:text-brand-700 transition-colors"
			>{name}</a
		>

		<!-- category and rating -->
		<div class="flex items-center justify-between gap-2 min-h-5">
			{#if category?.name}
				<span class="text-xs text-gray-500 truncate">{category.name}</span>
			{/if}
			<div
				class="text-xs flex items-center text-amber-600 gap-1 font-semibold shrink-0"
				aria-label={`${clamp(rating ?? MIN_RATING, MIN_RATING, MAX_RATING)} / ${MAX_RATING} ${$T('product.rating')}`}
			>
				<span class="text-nowrap">
					{rating ? `${clamp(rating, MIN_RATING, MAX_RATING)}` : $T('product.noVote')}
				</span>
				{#if rating}
					<span aria-hidden="true">★</span>
				{/if}
			</div>
		</div>

		<!-- price -->
		<div class="flex items-baseline flex-row gap-2 mt-auto">
			<span class="text-xs font-medium text-gray-400">{$T('common.startAt')}</span>
			<p class="font-bold text-brand-700 text-lg tracking-tight">
				{formatMoney(
					pricing?.priceRange?.start?.gross.currency ||
						CHANNELS.find((chan) => chan.slug === product.channel)?.currency ||
						'',
					pricing?.priceRange?.start?.gross.amount || 0,
				)}
			</p>
		</div>

		<!-- quick view -->
		<Button
			startIcon={OpenEye}
			variant="light"
			color="blue"
			size="sm"
			fullWidth
			class="group-hover:border-brand-200! transition-colors"
			onclick={handlePreviewProduct}
		>
			{$T('product.quickView')}
		</Button>
	</div>
</article>
