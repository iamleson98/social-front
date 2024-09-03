<script lang="ts">
	import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
	import { type Query, type QueryProductsArgs } from '$lib/gql/graphql';
	import { operationStore, PRODUCT_LIST_QUERY_STORE } from '$lib/stores/api';
	import ProductCard from './product-card.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { tClient } from '$i18n';
	import ProductFilterStateListener from './product-filter-state-listener.svelte';
	import { onMount } from 'svelte';
	import { productFilterParamStore } from '$lib/stores/app/product-filter';

	const productFetchStore = operationStore<Pick<Query, 'products'>, QueryProductsArgs>({
		kind: 'query',
		query: PRODUCT_LIST_QUERY_STORE,
		pause: true // wait for search params parsing process to finish
	});

	onMount(() => {
		const unsub = productFilterParamStore.subscribe((variables) =>
			productFetchStore.reexecute({
				context: { requestPolicy: 'network-only' },
				variables
			})
		);

		return unsub;
	});
</script>

<ProductFilterStateListener />

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

<div class="max-w-md m-auto">
	{#if $productFetchStore.fetching}
		{@render productCardSkeleton()}
		{@render productCardSkeleton()}
	{:else if $productFetchStore.error}
		<Alert variant="warning" size="sm" bordered>
			{tClient('error.failedToLoad')}
		</Alert>
	{:else if $productFetchStore.data?.products?.edges.length}
		{#each $productFetchStore.data?.products?.edges as edge, idx (idx)}
			{@const {
				node: { category, thumbnail, name, slug }
			} = edge}
			<ProductCard
				{name}
				categoryName={(category?.name || category?.id) as string}
				thumbnailUrl={thumbnail?.url as string}
				thumbnailAlt={thumbnail?.alt || name}
				{slug}
			/>
		{/each}
	{:else if $productFetchStore.data?.products?.edges.length === 0}
		<Alert variant="info" size="sm" bordered>
			{tClient('error.noResult')}
		</Alert>
	{/if}
</div>
