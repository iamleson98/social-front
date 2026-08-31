<script lang="ts">
	import { page } from '$app/state';
	import { T } from '$i18n';
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ProductCardSkeleton from '$lib/components/common/product/product-card-skeleton.svelte';
	import ProductCard from '$lib/components/common/product/product-card.svelte';
	import { IonFlame } from '$lib/components/icons';
	import Icon from '$lib/components/icons/icon.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		OrderDirection,
		ProductOrderField,
		type Query,
		type QueryProductsArgs,
	} from '$lib/gql/graphql';
	import { getCookieByKey } from '$lib/utils';
	import { CHANNEL_KEY } from '$lib/utils/consts';
	import { onMount } from 'svelte';

	const PAGE_SIZE = 12;

	let products = $state<NonNullable<Query['products']>['edges']>([]);
	let endCursor = $state<string | null>(null);
	let hasNextPage = $state(false);
	let fetching = $state(true);
	let error = $state<string | undefined>();

	const fetchProducts = async (after?: string | null): Promise<void> => {
		fetching = true;
		error = undefined;

		const result = await GRAPHQL_CLIENT.query<Pick<Query, 'products'>, QueryProductsArgs>(
			PRODUCT_LIST_QUERY,
			{
				channel: page.params.channel || getCookieByKey(CHANNEL_KEY),
				first: PAGE_SIZE,
				after: after ?? null,
				sortBy: {
					field: ProductOrderField.PublishedAt,
					direction: OrderDirection.Desc,
				},
			},
			{ requestPolicy: 'network-only' },
		);

		fetching = false;

		if (result.error) {
			error = result.error.message;
			return;
		}

		const connection = result.data?.products;
		if (!connection) {
			return;
		}

		products = after ? [...products, ...connection.edges] : connection.edges;
		endCursor = connection.pageInfo.endCursor ?? null;
		hasNextPage = connection.pageInfo.hasNextPage;
	};

	onMount(() => {
		void fetchProducts();
	});

	const handleLoadMore = (): void => {
		void fetchProducts(endCursor);
	};
</script>

<svelte:head>
	<title>{$T('pages.trending')} - Sitename</title>
	<meta name="description" content={$T('trending.description')} />
</svelte:head>

<div class="space-y-3">
	<!-- hero -->
	<div class="rounded-lg border border-orange-100 bg-gradient-to-r from-orange-50 to-red-50 p-6">
		<div class="flex items-center gap-2 text-orange-600">
			<Icon icon={IonFlame} size="lg" />
			<h1 class="text-xl font-bold">{$T('pages.trending')}</h1>
		</div>
		<p class="text-sm text-orange-500 mt-1">{$T('trending.description')}</p>
	</div>

	{#if error}
		<Alert variant="error" size="sm" bordered>{error}</Alert>
	{:else if fetching && !products.length}
		<div class="flex flex-wrap flex-row justify-between">
			{#each Array(6) as _, idx (idx)}
				<div class="w-1/2 p-0.5">
					<ProductCardSkeleton />
				</div>
			{/each}
		</div>
	{:else if products.length}
		<div class="flex flex-wrap flex-row justify-between">
			{#each products as { node }, idx (idx)}
				<div class="w-1/2 p-0.5">
					<ProductCard product={node} />
				</div>
			{/each}
		</div>

		{#if hasNextPage}
			<div class="mt-5 text-center">
				<Button onclick={handleLoadMore} variant="outline" size="xs" disabled={fetching}>
					{$T('common.loadMore')}
				</Button>
			</div>
		{/if}
	{:else}
		<Alert variant="info" size="sm" bordered>{$T('error.noResult')}</Alert>
	{/if}
</div>
