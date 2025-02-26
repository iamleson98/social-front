<script lang="ts">
	import { tranFunc } from '$i18n';
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Query, QueryProductsArgs } from '$lib/gql/graphql';
	import { PRODUCT_LIST_QUERY_STORE } from '$lib/api';
	import ProductCard from './product-card.svelte';
	import type { ProductFilterParams } from '$lib/stores/app/product-filter.svelte';
	import { operationStore } from '$lib/api/operation';

	type Props = {
		isLastPage: boolean;
		onLoadMore: (endCursor: string) => void;
		variables: ProductFilterParams;
	};

	let { isLastPage, onLoadMore, variables }: Props = $props();

	const productFetchStore = operationStore<Pick<Query, 'products'>, QueryProductsArgs>({
		kind: 'query',
		query: PRODUCT_LIST_QUERY_STORE,
		context: { requestPolicy: 'network-only' },
		variables
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

{#if $productFetchStore.fetching}
	{@render productCardSkeleton()}
	{@render productCardSkeleton()}
{:else if $productFetchStore.error}
	<Alert variant="warning" size="sm" bordered>
		{$tranFunc('error.failedToLoad')}
	</Alert>
{:else if $productFetchStore.data?.products?.edges.length}
	{#each $productFetchStore.data?.products?.edges as { node }, idx (idx)}
		<ProductCard product={node} />
	{/each}
	{#if isLastPage && $productFetchStore.data?.products?.pageInfo.hasNextPage && $productFetchStore.data?.products?.pageInfo.endCursor}
		<div class="mt-5 text-center">
			<Button
				onclick={() => onLoadMore($productFetchStore.data?.products?.pageInfo.endCursor as string)}
				variant="outline"
				size="xs"
			>
				{$tranFunc('common.loadMore')}
			</Button>
		</div>
	{/if}
{:else if $productFetchStore.data?.products?.edges.length === 0}
	<Alert variant="info" size="sm" bordered>
		{$tranFunc('error.noResult')}
	</Alert>
{/if}
