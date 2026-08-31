<script lang="ts">
	import { T } from '$i18n';
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ProductCardSkeleton from '$lib/components/common/product/product-card-skeleton.svelte';
	import ProductCard from '$lib/components/common/product/product-card.svelte';
	import { TablerHeartOff } from '$lib/components/icons/consts';
	import Icon from '$lib/components/icons/icon.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Product, Query, QueryProductsArgs } from '$lib/gql/graphql';
	import { wishlistStore } from '$lib/stores/app/wishlist';
	import { AppRoute, getCookieByKey } from '$lib/utils';
	import { CHANNEL_KEY } from '$lib/utils/consts';
	import { untrack } from 'svelte';

	const FETCH_PAGE_SIZE = 100;

	let products = $state<Product[]>([]);
	let fetching = $state(false);
	let error = $state<string | undefined>();

	/** ids saved in the wishlist but not returned by the API anymore (deleted / unpublished) */
	const missingIds = $derived(
		$wishlistStore.filter((id) => !products.some((product) => product.id === id)),
	);

	const fetchWishlistProducts = async (ids: string[]): Promise<void> => {
		fetching = true;
		error = undefined;

		const result = await GRAPHQL_CLIENT.query<Pick<Query, 'products'>, QueryProductsArgs>(
			PRODUCT_LIST_QUERY,
			{
				channel: getCookieByKey(CHANNEL_KEY),
				first: FETCH_PAGE_SIZE,
				filter: { ids },
			},
			{ requestPolicy: 'network-only' },
		);

		fetching = false;

		if (result.error) {
			error = result.error.message;
			return;
		}

		products = (result.data?.products?.edges || [])
			.map(({ node }) => node)
			.filter((product): product is Product => !!product?.id);
	};

	// refetch whenever the list of saved ids changes
	$effect(() => {
		const ids = $wishlistStore;
		untrack(() => {
			if (!ids.length) {
				products = [];
				return;
			}
			void fetchWishlistProducts(ids);
		});
	});
</script>

<svelte:head>
	<title>{$T('wishlist.title')} - Sitename</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-3">
		<h1 class="text-lg font-semibold text-gray-700">{$T('wishlist.title')}</h1>
		{#if $wishlistStore.length}
			<span class="text-xs text-gray-400">
				{$T('wishlist.itemCount', { count: $wishlistStore.length })}
			</span>
		{/if}
	</div>

	{#if fetching && !products.length}
		<div class="flex flex-wrap flex-row justify-between">
			{#each Array(4) as _, idx (idx)}
				<div class="w-1/2 p-0.5">
					<ProductCardSkeleton />
				</div>
			{/each}
		</div>
	{:else if error}
		<Alert variant="error" size="sm" bordered>{error}</Alert>
	{:else if !$wishlistStore.length || (!products.length && !missingIds.length)}
		<div class="h-full w-full flex items-center justify-center">
			<div class="text-center">
				<div class="flex justify-center mt-24">
					<Icon icon={TablerHeartOff} size="xl" class="text-gray-300" />
				</div>
				<div class="mt-3 text-gray-600">{$T('wishlist.empty')}</div>
				<div class="mt-1 text-xs text-gray-400">{$T('wishlist.emptyHint')}</div>
				<div class="mt-4">
					<a href={AppRoute.HOME()}>
						<Button variant="outline" size="sm">{$T('cart.continueShopping')}</Button>
					</a>
				</div>
			</div>
		</div>
	{:else if products.length}
		<div class="flex flex-wrap flex-row justify-between">
			{#each products as product (product.id)}
				<div class="w-1/2 p-0.5">
					<ProductCard {product} />
				</div>
			{/each}
		</div>

		{#if missingIds.length}
			<Alert variant="info" size="sm" bordered class="mt-2">
				{$T('wishlist.unavailableItems', { count: missingIds.length })}
			</Alert>
			<div class="mt-2 text-center">
				<Button
					variant="outline"
					size="xs"
					onclick={() => missingIds.forEach((id) => wishlistStore.remove(id))}
				>
					{$T('wishlist.removeUnavailable')}
				</Button>
			</div>
		{/if}
	{/if}
</div>
