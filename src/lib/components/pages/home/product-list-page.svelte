<script lang="ts">
	import { T } from '$i18n';
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import { operationStore } from '$lib/api/operation';
	import ProductCardSkeleton from '$lib/components/common/product/product-card-skeleton.svelte';
	import ProductCard from '$lib/components/common/product/product-card.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Query, QueryProductsArgs } from '$lib/gql/graphql';
	import type { ProductFilterParams } from '$lib/stores/app/product-filter.svelte';

	type Props = {
		isLastPage: boolean;
		onLoadMore: (endCursor: string) => void;
		variables: ProductFilterParams;
	};

	let { isLastPage, onLoadMore, variables }: Props = $props();

	const productFetchStore = operationStore<Pick<Query, 'products'>, QueryProductsArgs>({
		query: PRODUCT_LIST_QUERY,
		context: { requestPolicy: 'network-only' },
		variables,
	});
</script>

<div class="mt-1.5">
	{#if $productFetchStore.fetching}
		<div class="flex flex-wrap flex-row justify-between">
			{#each Array(2) as _, idx (idx)}
				<div class="w-1/2 p-0.5">
					<ProductCardSkeleton />
				</div>
			{/each}
		</div>
	{:else if $productFetchStore.error}
		<Alert variant="warning" size="sm" bordered>
			{$T('error.failedToLoad')}
		</Alert>
	{:else if $productFetchStore.data?.products?.edges.length}
		<div class="flex flex-wrap flex-row justify-between">
			{#each $productFetchStore.data?.products?.edges as { node }, idx (idx)}
				<div class="w-1/2 p-0.5">
					<ProductCard product={node} />
				</div>
			{/each}
		</div>

		{#if isLastPage && $productFetchStore.data?.products?.pageInfo.hasNextPage && $productFetchStore.data?.products?.pageInfo.endCursor}
			<div class="mt-5 text-center">
				<Button
					onclick={() =>
						onLoadMore($productFetchStore.data?.products?.pageInfo.endCursor as string)}
					variant="outline"
					size="xs"
				>
					{$T('common.loadMore')}
				</Button>
			</div>
		{/if}
	{:else if $productFetchStore.data?.products?.edges.length === 0}
		<Alert variant="info" size="sm" bordered>
			{$T('error.noResult')}
		</Alert>
	{/if}
</div>
