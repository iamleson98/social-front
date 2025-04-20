<script lang="ts">
	import { goto } from '$app/navigation';
	import { tranFunc } from '$i18n';
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import { Icon, InforCircle } from '$lib/components/icons';
	import { AFTER, BEFORE, FIRST, LAST } from '$lib/components/pages/home/common';
	import ProductFilterStateListener from '$lib/components/pages/home/product-filter-state-listener.svelte';
	import Filter from '$lib/components/pages/settings/products/filter.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Table, TableSkeleton, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Product, type Query, type QueryProductsArgs } from '$lib/gql/graphql';
	import { productFilterParamStore } from '$lib/stores/app/product-filter.svelte';
	import { AppRoute } from '$lib/utils';
	import { formatCurrency } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';

	const DEFAULT_BATCH = 10; // 10 is also default rows per page in table footer

	const productFetchStore = operationStore<Pick<Query, 'products'>, QueryProductsArgs>({
		kind: 'query',
		query: PRODUCT_LIST_QUERY_ADMIN,
		context: { requestPolicy: 'cache-and-network' },
		variables: $productFilterParamStore
	});

	$effect(() => {
		if ($productFilterParamStore.reload) {
			productFetchStore.reexecute({
				variables: $productFilterParamStore
			});
			$productFilterParamStore.reload = false; // prevent calling agrain
		}
	});

	onMount(() => productFilterParamStore.reset); // reset filter params

	const productColumns: TableColumnProps<Product>[] = $derived([
		{
			title: $tranFunc('settings.name'),
			child: name,
			sortable: true
		},
		{
			title: $tranFunc('settings.availability'),
			child: availability
		},
		{
			title: $tranFunc('settings.prices'),
			child: prices
		},
		{
			title: $tranFunc('settings.createdAt'),
			child: createdAt,
			sortable: true
		}
	]);

	const applyFilterToUrlPath = async () => {
		const searchParams = new URLSearchParams();

		if ($productFilterParamStore.first) {
			searchParams.set(FIRST, $productFilterParamStore.first.toString());
		} else if ($productFilterParamStore.last) {
			searchParams.set(LAST, $productFilterParamStore.last.toString());
		}

		if ($productFilterParamStore.before) {
			searchParams.set(BEFORE, $productFilterParamStore.before);
		} else if ($productFilterParamStore.after) {
			searchParams.set(AFTER, $productFilterParamStore.after);
		}

		await goto(`${AppRoute.SETTINGS_PRODUCTS()}?${searchParams.toString()}`, {
			invalidateAll: false,
			replaceState: false
		});
	};

	const handleNextPagelick = (after: string) => {
		$productFilterParamStore = {
			...$productFilterParamStore,
			after,
			before: null,
			first: $productFilterParamStore.last || DEFAULT_BATCH,
			last: null
		};
		applyFilterToUrlPath();
	};

	const handlePreviousPagelick = (before: string) => {
		$productFilterParamStore = {
			...$productFilterParamStore,
			before,
			after: null,
			last: $productFilterParamStore.first || DEFAULT_BATCH,
			first: null
		};
		applyFilterToUrlPath();
	};

	const handleRowsPerPageChange = (no: number) => {
		if ($productFilterParamStore.first) $productFilterParamStore.first = no;
		else if ($productFilterParamStore.last) $productFilterParamStore.last = no;
		applyFilterToUrlPath();
	};
</script>

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
		<span class="whitespace-nowrap">{item.channelListings?.length || 0} channels</span>
	</div>
{/snippet}

{#snippet prices({ item }: { item: Product })}
	{#each item.channelListings || [] as channelListing}
		{@const startAmount = channelListing.pricing?.priceRange?.start?.gross?.amount || 0}
		{@const endAmount = channelListing.pricing?.priceRange?.stop?.gross?.amount || 0}
		<div class="flex items-center justify-between gap-1">
			<span class="text-gray-500 text-xs">{channelListing.channel.currencyCode}</span>
			<span class="font-semibold text-blue-600 text-right">
				{formatCurrency(startAmount)}-{formatCurrency(endAmount)}
			</span>
		</div>
	{/each}
{/snippet}

{#snippet createdAt({ item }: { item: Product })}
	<span class="whitespace-nowrap">{dayjs(item.created).format('DD/MM/YYYY HH:mm')}</span>
{/snippet}

<div class="mb-2">
	<Filter />
</div>

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
			onNextPagelick={handleNextPagelick}
			onPreviousPagelick={handlePreviousPagelick}
			onChangeRowsPerPage={handleRowsPerPageChange}
			rowsPerPage={$productFilterParamStore.first || $productFilterParamStore.last}
		/>
	{/if}
</div>
