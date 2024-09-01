<script lang="ts">
	import { graphqlClient } from '$lib/client';
	import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
	import {
		OrderDirection,
		ProductOrderField,
		type ProductCountableEdge,
		type ProductOrder,
		type Query,
		type QueryProductsArgs
	} from '$lib/gql/graphql';
	import { PRODUCT_LIST_QUERY_STORE } from '$lib/stores/api';
	import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import ProductCard from './product-card.svelte';
	import { page } from '$app/stores';
	import { queryStore, type RequestPolicy } from '@urql/svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { orderByField, sortKey } from './common';
	import { onMount, tick } from 'svelte';
	import { writable } from 'svelte/store';

	const productListBatch = 10;

	type ProductOrderProps = Pick<ProductOrder, 'direction' | 'field'>;

	let products = $state.frozen<ProductCountableEdge[]>([]);
	let fetching = $state(true);
	let productOrderState = $state.frozen<ProductOrderProps>({
		field: ProductOrderField.Price,
		direction: OrderDirection.Desc
	});

	const fetchProducts = async (requestPolicy: RequestPolicy) => {
		fetching = true;

		const result = await graphqlClient
			.query<Pick<Query, 'products'>, QueryProductsArgs>(
				PRODUCT_LIST_QUERY_STORE,
				{
					first: productListBatch,
					channel: clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug),
					sortBy: productOrderState
				},
				{ requestPolicy }
			)
			.toPromise();

		fetching = false;

		if (result.error) return;

		if (result.data?.products) {
			products = result.data.products.edges;
		}
	};

	onMount(async () => {
		await fetchProducts('cache-and-network');
	});

	$effect(() => {
		let orderBy = $page.url.searchParams
			.get(orderByField)
			?.trim()
			.toUpperCase() as ProductOrderField;
		if (!Object.values(ProductOrderField).includes(orderBy)) orderBy = ProductOrderField.Price;

		let sortDirection = $page.url.searchParams.get(sortKey)?.trim().toUpperCase() as OrderDirection;
		if (!Object.values(OrderDirection).includes(sortDirection)) sortDirection = OrderDirection.Desc;

		if (orderBy !== productOrderState.field || sortDirection !== productOrderState.direction) {
			console.log(orderBy, sortDirection);

			productOrderState = {
				field: orderBy,
				direction: sortDirection
			};
			tick();

			fetchProducts('network-only');
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

{#if fetching}
	{@render productCardSkeleton()}
	{@render productCardSkeleton()}
{:else if products.length}
	{#each products as edge, idx (idx)}
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
	<!-- {:else}
	<Alert size="sm" variant="error">Failed to load products. Please try again later.</Alert> -->
{/if}
