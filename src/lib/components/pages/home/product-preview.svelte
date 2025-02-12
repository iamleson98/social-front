<script lang="ts">
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { type Query } from '$lib/gql/graphql';
	import { slideShowManager } from '$lib/stores/ui/slideshow';
	import { CHANNEL_KEY, COUNTRY_CODE_KEY } from '$lib/utils/consts';
	import { onMount } from 'svelte';
	import ProductSlideShowPannel from '../products/detail/product-slide-show-pannel.svelte';
	import { operationStore } from '$lib/api/operation';
	import { PRODUCT_DETAIL_QUERY_STORE } from '$lib/api';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { DEFAULT_CHANNEL } from '$lib/utils/channels';
	import ProductPricingPannel from '../products/detail/product-pricing-pannel.svelte';

	type Props = {
		productSlug: string;
	};

	let { productSlug }: Props = $props();

	const CHANNEL_SLUG = clientSideGetCookieOrDefault(CHANNEL_KEY, DEFAULT_CHANNEL.slug);
	const COUNTRY_CODE = clientSideGetCookieOrDefault(
		COUNTRY_CODE_KEY,
		DEFAULT_CHANNEL.defaultCountryCode
	);

	const productDetailStore = operationStore<Pick<Query, 'product'>>({
		kind: 'query',
		query: PRODUCT_DETAIL_QUERY_STORE,
		variables: {
			slug: productSlug,
			channel: CHANNEL_SLUG,
			countryCode: COUNTRY_CODE
		},
		requestPolicy: 'cache-and-network'
	});

	onMount(() => {
		const unsub = productDetailStore.subscribe((result) => {
			if (result.data?.product) {
				slideShowManager.setMedias(result.data.product.media || []);
			}
		});

		return () => {
			unsub();
			slideShowManager.reset();
		};
	});
</script>

<div>
	{#if $productDetailStore.fetching}
		<SkeletonContainer>
			<Skeleton class="w-full h-96" rounded={false} />
		</SkeletonContainer>
	{:else if $productDetailStore.data?.product}
		<ProductSlideShowPannel />
		<ProductPricingPannel
			useForPreviewModal
			productInformation={$productDetailStore.data.product}
		/>
	{/if}
</div>
