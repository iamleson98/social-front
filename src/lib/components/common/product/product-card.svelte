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

	const toggleWishlist = (): void => {
		const added = wishlistStore.toggle(product.id);
		toast.success(added ? $T('wishlist.added') : $T('wishlist.removed'));
	};

	// shallow routing to display product preview modal
	const handlePreviewProduct = (): void => {
		PRODUCT_PREVIEW_STORE.set(product);
	};
</script>

<div class="bg-white rounded-lg border overflow-hidden" transition:fade>
	<div class="product-card-picture relative">
		<a href={AppRoute.PRODUCT_DETAILS(slug)} aria-label={name}>
			<div
				class="pt-[100%] bg-cover bg-center bg-no-repeat"
				style="background-image: url('{thumbnail?.url}');"
			></div>
		</a>

		<div class="absolute top-0 right-0 p-2">
			<IconButton
				icon={isWishlisted ? HeartFilled : Heart}
				variant="light"
				size="sm"
				class={isWishlisted ? 'text-red-500!' : ''}
				aria-label={$T('wishlist.toggleAria')}
				onclick={toggleWishlist}
			/>
		</div>

		{#if pricing?.onSale}
			<Badge
				color="red"
				variant="filled"
				startIcon={Discount}
				text={$T('product.onSale')}
				class="absolute top-4 left-2"
			/>
		{/if}
	</div>

	<div class="p-3">
		<!-- name -->
		<a
			href={AppRoute.PRODUCT_DETAILS(product.slug)}
			class="font-semibold text-base text-gray-700 leading-5 hover:underline mb-3 block">{name}</a
		>

		<!-- category and voting -->
		<div class="mb-3 flex items-center justify-between">
			<Badge color="violet" variant="filled" text={(category?.name || category?.id) as string} />
			<div class="text-xs flex items-center text-red-600 gap-1 font-semibold">
				<div class="text-nowrap">
					{rating
						? `${clamp(rating, MIN_RATING, MAX_RATING)} / ${MAX_RATING}`
						: $T('product.noVote')}
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
			<p class="text-xs font-normal text-gray-500">{$T('common.startAt')}</p>
			<p class="font-bold text-blue-700 text-xl underline">
				{formatMoney(
					pricing?.priceRange?.start?.gross.currency ||
						CHANNELS.find((chan) => chan.slug === product.channel)?.currency ||
						'',
					pricing?.priceRange?.start?.gross.amount || 0,
				)}
			</p>
		</div>

		<Button startIcon={OpenEye} variant="light" size="sm" fullWidth onclick={handlePreviewProduct}>
			{$T('product.quickView')}
		</Button>
	</div>
</div>
