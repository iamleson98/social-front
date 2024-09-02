<script lang="ts">
	import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
	import {
		OrderDirection,
		ProductOrderField,
		type ProductOrder,
		type Query,
		type QueryProductsArgs
	} from '$lib/gql/graphql';
	import { operationStore, PRODUCT_LIST_QUERY_STORE } from '$lib/stores/api';
	import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import ProductCard from './product-card.svelte';
	import { page } from '$app/stores';
	import { orderByField, priceRange, sortKey } from './common';
	import { numberRegex, parseUrlSearchParams } from '$lib/utils/utils';
	import { Alert } from '$lib/components/ui/Alert';
	import { tClient } from '$i18n';

	const productListBatch = 10;

	type ProductOrderProps = Pick<ProductOrder, 'direction' | 'field'>;

	let productOrderState = $state.frozen<ProductOrderProps>({
		field: ProductOrderField.Price,
		direction: OrderDirection.Desc
	});

	let priceRangeInput = $state('');

	const productFetchStore = operationStore<Pick<Query, 'products'>, QueryProductsArgs>({
		kind: 'query',
		query: PRODUCT_LIST_QUERY_STORE,
		variables: {
			first: productListBatch,
			channel: clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug),
			sortBy: (() => productOrderState)()
		}
	});

	$effect(() => {
		const searchParams = parseUrlSearchParams($page.url);
		let sortDirection = searchParams[sortKey];
		let sortField = searchParams[orderByField];

		if (sortDirection && typeof sortDirection === 'string')
			sortDirection = sortDirection.toUpperCase();
		if (sortField && typeof sortField === 'string') sortField = sortField.toUpperCase();

		if (
			(sortDirection !== productOrderState.direction &&
				Object.values(OrderDirection).includes(sortDirection as OrderDirection)) ||
			(sortField !== productOrderState.field &&
				Object.values(ProductOrderField).includes(sortField as ProductOrderField))
		) {
			productFetchStore.reexecute({
				context: { requestPolicy: 'network-only' },
				variables: { sortBy: productOrderState }
			});

			productOrderState = {
				field: sortField as ProductOrderField,
				direction: sortDirection as OrderDirection
			};
		}
	});

	$effect(() => {
		const priceRangeParam = $page.url.searchParams.get(priceRange)?.trim();
		if (priceRangeParam && priceRangeParam !== priceRangeInput) {
			const prices = priceRangeParam.split(',');

			if (prices.length && prices.every((end) => numberRegex.test(end))) {
				productFetchStore.reexecute({
					context: { requestPolicy: 'network-only' },
					variables: {
						filter: {
							price: {
								gte: Number(prices[0]),
								lte: prices[1] ? Number(prices[1]) : null
							}
						},
						sortBy: productOrderState
					}
				});

				priceRangeInput = priceRangeParam;
			}
		}
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
	{:else}
		<Alert variant="info" size="sm" bordered>
			{tClient('error.noResult')}
		</Alert>
	{/if}
</div>
