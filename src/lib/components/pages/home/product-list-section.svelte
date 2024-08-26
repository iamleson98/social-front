<script lang="ts">
	import { graphqlClient } from '$lib/client';
	import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
	import type { PageInfo, ProductCountableEdge, Query } from '$lib/gql/graphql';
	import { PRODUCT_LIST_QUERY_STORE } from '$lib/stores/api';
	import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { onMount, tick } from 'svelte';
	import ProductCard from './product-card.svelte';

	const productListBatch = 10;

	let products = $state<ProductCountableEdge[]>([]);
	let pageInfo = $state<PageInfo | null>(null);
	let loading = $state(true);

	const fetchProducts = async () => {
		const productsResult = await graphqlClient
			.query<Pick<Query, 'products'>>(PRODUCT_LIST_QUERY_STORE, {
				first: productListBatch,
				channel: clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug)
			})
			.toPromise();

		loading = false;
		await tick();

		if (preHandleGraphqlResult(productsResult)) {
			return;
		}

		if (productsResult.data?.products) {
			products = productsResult.data.products.edges;
			pageInfo = productsResult.data.products.pageInfo;
		}
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

{#if loading}
	{@render productCardSkeleton()}
	{@render productCardSkeleton()}
{:else}
	{#each products as { node }, idx (idx)}
		<ProductCard
			name={node.name}
			categoryName={(node.category?.name || node.category?.id) as string}
			thumbnailUrl={node.thumbnail?.url as string}
			thumbnailAlt={node.thumbnail?.alt || node.name}
			slug={node.slug}
		/>
	{/each}
{/if}
