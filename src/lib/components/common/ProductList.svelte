<script lang="ts">
	import type { ProductsList$input } from '$houdini';
	import {
		OrderDirection,
		OrderDirection as OrderDirectionType,
		type PageInfo,
		type ProductCountableEdge
	} from '$lib/gql/graphql';
	import { PRODUCT_LIST_QUERY_STORE } from '$lib/stores/api/product';
	import { toastStore } from '$lib/stores/ui/toast';
	import { DEFAULT_CHANNEL_NAME } from '$lib/utils/types';
	import { constructPagination } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	// import { performGraphqlQuery } from '$lib/utils/api';

	let products: ProductCountableEdge[] = [];
	let pageInfo: PageInfo = {
		hasNextPage: false,
		hasPreviousPage: false
	};
	let numOfProductsPerPage = 10;
	let beforeCursor = '';
	let afterCursor = '';
	let first: number | undefined = 10;
	let last: number | undefined = undefined;
	let orderDirection: OrderDirectionType = OrderDirection.Asc;
	let loading = false;
	let channel = DEFAULT_CHANNEL_NAME;

	const fetchMoreProducts = async () => {
		loading = true;

		if (orderDirection === OrderDirectionType.Asc) {
			first = numOfProductsPerPage;
			last = undefined;
		} else {
			last = numOfProductsPerPage;
			first = undefined;
		}

		const paginParams = constructPagination<ProductsList$input>(
			beforeCursor,
			afterCursor,
			first,
			last
		);
		const variables: ProductsList$input = {
			...paginParams,
			channel
		};

		// const productFetchResult = await PRODUCT_LIST_QUERY_STORE.fetch({ variables });

		// //
		// loading = false;

		// if (productFetchResult.errors?.length) {
		// 	toastStore.send({
		// 		variant: 'error',
		// 		message: productFetchResult.errors[0].message
		// 	});
		// 	return;
		// }

		// pageInfo = productFetchResult.data?.products?.pageInfo as PageInfo;
		// products = productFetchResult.data?.products?.edges as ProductCountableEdge[];
	};

	onMount(async () => {
		// await fetchMoreProducts();
    // performGraphqlQuery(PRODUCT_LIST_QUERY_STORE, ).subscribe()
	});
</script>

<div>
	{#if loading}
		<div>loading...</div>
	{:else}
		<div>
			{#each products as product (product.cursor)}
				<div class="w-[500px] rounded p-2">
					<p>{product.node.name}</p>
					<p>{product.node.description}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
