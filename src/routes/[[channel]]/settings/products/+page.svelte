<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_LIST_QUERY_STORE } from '$lib/api';
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import { Icon, InforCircle } from '$lib/components/icons';
	import ProductFilterStateListener from '$lib/components/pages/home/product-filter-state-listener.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Table, TableSkeleton, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Product, Query, QueryProductsArgs } from '$lib/gql/graphql';
	import { productFilterParamStore } from '$lib/stores/app/product-filter.svelte';
	import { AppRoute } from '$lib/utils';
	import dayjs from 'dayjs';
	import { tick } from 'svelte';
	import { CurrencyCodes } from 'validator/lib/isISO4217';

	let productLoadPageVariables = $state.raw([$productFilterParamStore]);

	$effect(() => {
		if (!$productFilterParamStore.reload) return;

		productLoadPageVariables = [];
		tick().then(() => {
			productFilterParamStore.set({
				...$productFilterParamStore,
				reload: false
			});
			productLoadPageVariables = [$productFilterParamStore];
		});
	});

	const handleLoadMore = (afterCursor: string) => {
		productLoadPageVariables = productLoadPageVariables.concat({
			...$productFilterParamStore,
			after: afterCursor
		});
	};

	const productFetchStore = operationStore<Pick<Query, 'products'>, QueryProductsArgs>({
		kind: 'query',
		query: PRODUCT_LIST_QUERY_ADMIN,
		context: { requestPolicy: 'cache-and-network' },
		variables: $productFilterParamStore
	});

	const productColumns: TableColumnProps<Product>[] = [
		{
			title: 'Name',
			child: name
		},
		{
			title: 'Availability',
			child: availability
		},
		{
			title: 'Prices',
			child: prices
		},
		{
			title: 'Created',
			child: createdAt
		}
	];
</script>

<!-- url search params listener -->
<ProductFilterStateListener />

{#snippet name({ item }: { item: Product })}
	<div class="flex gap-1 items-center">
		<div
			class="h-8 w-8 rounded-lg border border-gray-100 overflow-hidden bg-cover bg-center bg-no-repeat"
			style="background-image: url({item.thumbnail?.url})"
		></div>
		<a class="link link-hover" href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)}>{item.name}</a>
	</div>
{/snippet}

{#snippet availability({ item }: { item: Product })}
	{@const tooltip = item.channelListings?.length
		? item.channelListings.map((list) => list.channel.slug).join(', ')
		: ''}
	{@const tooltipClass = tooltip ? 'cursor-help tooltip tooltip-top tooltip-info' : ''}
	<div class="flex items-center gap-1">
		<div class={tooltipClass} data-tip={tooltip}>
			<Icon icon={InforCircle} class="size-3 text-blue-500" />
		</div>
		<span>{item.channelListings?.length || 0} channels</span>
	</div>
{/snippet}

{#snippet prices({ item }: { item: Product })}
	<!-- {item.description} -->
	{#each item.channelListings || [] as channelListing}
		<div class="flex items-center gap-1">
			<span class="w-1/3 text-gray-400 text-xs">{channelListing.channel.currencyCode}</span>
			<span class="w-2/3"
				>{channelListing.pricing?.priceRange?.start?.gross?.amount || ''}-{channelListing.pricing
					?.priceRange?.stop?.gross?.amount || ''}</span
			>
		</div>
	{/each}
{/snippet}

{#snippet createdAt({ item }: { item: Product })}
	<!-- {item.created} -->
	{dayjs(item.created).format('DD/MM/YYYY')}
{/snippet}

<div class="bg-white rounded-lg p-3 border border-gray-200">
	{#if $productFetchStore.fetching}
		<TableSkeleton numColumns={4} showPagination />
	{:else if $productFetchStore.error}
		<Alert variant="warning" size="sm" bordered>
			{$tranFunc('error.failedToLoad')}
		</Alert>
	{:else if $productFetchStore.data?.products}
		{@const products = $productFetchStore.data?.products?.edges?.map((edge) => edge?.node)}
		<Table
			items={products}
			columns={productColumns}
			scale="sm"
			pagination={$productFetchStore.data?.products.pageInfo}
		/>
	{/if}
</div>
