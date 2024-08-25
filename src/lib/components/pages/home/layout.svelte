<script lang="ts">
	import { graphqlClient } from '$lib/client';
	import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
	import { Heart, Icon, Search, ShoppingBagPlus, TruckDelivery } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import type { PageInfo, ProductCountableEdge, Query } from '$lib/gql/graphql';
	import { PRODUCT_LIST_QUERY_STORE } from '$lib/stores/api';
	import { AppRoute } from '$lib/utils';
	import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import Sidebar from './sidebar.svelte';

	type ProductProps = {
		name: string;
		categoryName: string;
		thumbnailUrl: string;
		price?: number;
		thumbnailAlt?: string | null;
		slug: string;
	};

	const batch = 10;

	let products = $state<ProductCountableEdge[]>([]);
	let pageInfo = $state<PageInfo | null>(null);
	let loading = $state(true);

	const fetchProducts = async () => {
		const productsResult = await graphqlClient
			.query<Pick<Query, 'products'>>(PRODUCT_LIST_QUERY_STORE, {
				first: batch,
				channel: clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug)
			})
			.toPromise();
		loading = false;

		if (preHandleGraphqlResult(productsResult)) {
			return;
		}

		if (productsResult.data?.products) {
			products = productsResult.data.products.edges;
			pageInfo = productsResult.data.products.pageInfo;
		}
		tick();
	};

	onMount(async () => {
		await fetchProducts();
	});
</script>

{#snippet productCardSkeleton()}
	<SkeletonContainer class="max-w-md m-auto mb-3 bg-white-rounded">
		<div class="product-card-picture relative">
			<Skeleton class="w-full h-96" rounded={false} />
			<div class="absolute top-0 right-0 p-2">
				<Skeleton class="w-6 h-6" />
			</div>
		</div>

		<div class="p-6">
			<Skeleton class="w-full h-8 mb-3" />
			<Skeleton class="w-14 h-5 mb-3" />
			<Skeleton class="w-full h-7" />
		</div>
	</SkeletonContainer>
{/snippet}

{#snippet product({ name, categoryName, thumbnailAlt, thumbnailUrl, slug }: ProductProps)}
	<div class="bg-white-rounded border max-w-md m-auto mb-3" transition:fade>
		<!-- picture -->
		<div class="product-card-picture relative">
			<div class="p-5">
				<a href={`${AppRoute.PRODUCTS}/${encodeURIComponent(slug)}`}>
					<img src={thumbnailUrl} alt={thumbnailAlt} class="select-none" loading="lazy" />
				</a>
			</div>

			<div class="absolute top-0 right-0 p-2">
				<IconButton icon={Heart} variant="light" size="sm" />
			</div>
		</div>

		<!-- short detail -->
		<div class="p-6">
			<!-- title and price -->
			<div class="flex items-center justify-between mb-3">
				<a
					href={`${AppRoute.PRODUCTS}/${encodeURIComponent(slug)}`}
					class="font-semibold leading-5 text-lg text-gray-700 hover:underline">{name}</a
				>
				<p class="leading-5 font-extrabold text-blue-700 text-2xl">$299</p>
			</div>

			<!-- category -->
			<div class="mb-2">
				<Badge color="orange" variant="light" text={categoryName} />
			</div>

			<Button variant="filled" startIcon={ShoppingBagPlus} size="sm" fullWidth>Add to cart</Button>

			<div class="text-xs text-gray-500 flex items-center gap-1">
				<Icon icon={TruckDelivery} />
				<p>
					Estimated Delivery <span class="font-semibold text-gray-600">Jun 23 - Jun 24</span>
				</p>
			</div>
		</div>
	</div>
{/snippet}

{#snippet recommendation()}
	<div class="bg-white rounded-lg p-4 max-w-md w-full">
		<div class="flex justify-between mb-4">
			<h2 class="font-bold text-gray-800">Products you may like</h2>
			<span class="text-sm text-gray-500"
				>selected by <span class="text-red-500 font-bold">Sitename</span></span
			>
		</div>
		<div class="space-y-4">
			<!-- Product 1 -->
			<div class="flex items-center space-x-4">
				<img
					src="https://via.placeholder.com/50"
					alt="Product  of a cooking pot"
					class="w-12 h-12 object-cover"
				/>
				<div class="flex-1">
					<p class="text-gray-700 text-sm">
						A woman from future and she is very beautiful and then...
					</p>
					<div class="flex text-gray-500 text-xs mt-2 space-x-4">
						<span>15 <i class="fas fa-shopping-cart"></i></span>
						<span>234 <i class="fas fa-heart"></i></span>
						<span>234 <i class="fas fa-share-alt"></i></span>
					</div>
				</div>
			</div>
			<hr />
			<!-- Product 2 -->
			<div class="flex items-center space-x-4">
				<img
					src="https://via.placeholder.com/50"
					alt="Product  of a sneaker"
					class="w-12 h-12 object-cover"
				/>
				<div class="flex-1">
					<p class="text-gray-700 text-sm">A woman from future and she is very beau...</p>
					<div class="flex text-gray-500 text-xs mt-2 space-x-4">
						<span>15 <i class="fas fa-shopping-cart"></i></span>
						<span>234 <i class="fas fa-heart"></i></span>
						<span>234 <i class="fas fa-share-alt"></i></span>
					</div>
				</div>
			</div>
			<hr />
			<!-- Product 3 -->
			<div class="flex items-center space-x-4">
				<img
					src="https://via.placeholder.com/50"
					alt="Product  of a cap"
					class="w-12 h-12 object-cover"
				/>
				<div class="flex-1">
					<p class="text-gray-700 text-sm">A woman from future and she is very beau...</p>
					<div class="flex text-gray-500 text-xs mt-2 space-x-4">
						<span>15 <i class="fas fa-shopping-cart"></i></span>
						<span>234 <i class="fas fa-heart"></i></span>
						<span>234 <i class="fas fa-share-alt"></i></span>
					</div>
				</div>
			</div>
		</div>
		<button
			class="block w-full bg-blue-500 text-white font-bold py-2 mt-4 rounded-lg hover:bg-blue-600"
		>
			VIEW ALL
		</button>
	</div>
{/snippet}

<div class="flex gap-6">
	<!-- side controller -->
	<aside class="sticky overflow-auto top-16 h-screen w-1/5" style="scrollbar-width: none;">
		<Sidebar />
	</aside>

	<!-- product - recommendation display -->
	<div class="w-4/5 flex gap-3">
		<!-- product list -->
		<div class="w-2/3 tablet:w-full">
			{#if loading}
				{@render productCardSkeleton()}
				{@render productCardSkeleton()}
			{:else}
				{#each products as { node }, idx (idx)}
					{@render product({
						name: node.name,
						categoryName: (node.category?.name || node.category?.id) as string,
						thumbnailUrl: node.thumbnail?.url as string,
						thumbnailAlt: node.thumbnail?.alt || node.name,
						slug: node.slug
						// price: node.pricing
					})}
				{/each}
			{/if}
		</div>

		<!-- recommendation -->
		<div class="w-1/3 tablet:hidden sticky overflow-auto top-16 h-screen" style="scrollbar-width: none;">
			{@render recommendation()}
		</div>
	</div>
</div>

<style lang="postcss">
	.bg-white-rounded {
		@apply bg-white rounded-md;
	}
</style>
