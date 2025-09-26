<script lang="ts">
	import { PRODUCT_DETAIL_QUERY } from '$lib/api';
	import { operationStore } from '$lib/api/operation';
	import ProductPricingPannel from '$lib/components/pages/products/detail/product-pricing-pannel.svelte';
	import ProductSlideShowPannel from '$lib/components/pages/products/detail/product-slide-show-pannel.svelte';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { type ProductMedia, type Query } from '$lib/gql/graphql';
	import { DEFAULT_CHANNEL } from '$lib/utils/consts';
	import { CHANNEL_KEY, COUNTRY_CODE_KEY } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { onMount } from 'svelte';

	type Props = {
		productSlug: string;
	};

	let { productSlug }: Props = $props();

	const CHANNEL_SLUG = clientSideGetCookieOrDefault(CHANNEL_KEY, DEFAULT_CHANNEL.slug);
	const COUNTRY_CODE = clientSideGetCookieOrDefault(
		COUNTRY_CODE_KEY,
		DEFAULT_CHANNEL.defaultCountryCode,
	);
	let slideShowImages = $state.raw<ProductMedia[]>([]);

	const productDetailStore = operationStore<Pick<Query, 'product'>>({
		query: PRODUCT_DETAIL_QUERY,
		variables: {
			slug: productSlug,
			channel: CHANNEL_SLUG,
			countryCode: COUNTRY_CODE,
		},
		requestPolicy: 'cache-and-network',
	});

	onMount(() =>
		productDetailStore.subscribe((result) => {
			if (result.data?.product?.media) {
				slideShowImages = result.data.product.media;
			}
		}),
	);
</script>

<div class="max-h-[700px] overflow-y-scroll">
	{#if $productDetailStore.fetching}
		<SkeletonContainer>
			<Skeleton class="w-full h-96" rounded={false} />
		</SkeletonContainer>
	{:else if $productDetailStore.data?.product}
		<ProductSlideShowPannel medias={slideShowImages} />
		<div class="mb-2"></div>
		<ProductPricingPannel
			useForPreviewModal
			productInformation={$productDetailStore.data.product}
		/>
	{/if}
</div>
