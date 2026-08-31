<script lang="ts">
	import { T } from '$i18n';
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import { operationStore } from '$lib/api/operation';
	import ProductCardSkeleton from '$lib/components/common/product/product-card-skeleton.svelte';
	import ProductCard from '$lib/components/common/product/product-card.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Query, QueryProductsArgs } from '$lib/gql/graphql';

	interface Props {
		variables: QueryProductsArgs;
		isLastPage: boolean;
		onLoadMore: (_endCursor: string) => void;
	}

	const { variables, isLastPage, onLoadMore }: Props = $props();

	// the initial variables value is intentionally captured to bootstrap the store;
	// subsequent prop changes are handled by the $effect below
	// svelte-ignore state_referenced_locally
	const productFetchStore = operationStore<Pick<Query, 'products'>, QueryProductsArgs>({
		query: PRODUCT_LIST_QUERY,
		context: { requestPolicy: 'network-only' },
		variables,
	});

	let isFirstVariablesPass = true;

	// re-fetch when the parent updates the variables (e.g. sort / price filter changed)
	$effect(() => {
		const currentVariables = variables;
		if (isFirstVariablesPass) {
			isFirstVariablesPass = false;
			return; // the store already ran with the initial variables
		}
		productFetchStore.reexecute({ variables: currentVariables });
	});
</script>

<div>
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
			{$T('category.noProducts')}
		</Alert>
	{/if}
</div>
