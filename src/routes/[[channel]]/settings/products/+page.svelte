<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { Icon, InforCircle, Search } from '$lib/components/icons';
	import ProductFilterStateListener from '$lib/components/pages/home/product-filter-state-listener.svelte';
	import Filter from '$lib/components/pages/settings/products/filter.svelte';
	import { Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { ProductOrderField, type Product, type QueryProductsArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { formatCurrency } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	let productsFilterVariables = $state<QueryProductsArgs>({
		first: 10,
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const productColumns: TableColumnProps<Product, ProductOrderField>[] = $derived([
		{
			title: $tranFunc('settings.name'),
			child: name,
			sortable: true,
			key: ProductOrderField.Name,
		},
		{
			title: $tranFunc('settings.availability'),
			child: availability,
		},
		{
			title: $tranFunc('settings.prices'),
			child: prices,
		},
		{
			title: $tranFunc('settings.createdAt'),
			child: createdAt,
			sortable: true,
			key: ProductOrderField.CreatedAt,
		},
	]);
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

<div class="mb-2 flex items-center gap-2">
	<Filter />
	<Input size="sm" placeholder="Enter query" startIcon={Search} />
</div>

<GraphqlPaginableTable
	query={PRODUCT_LIST_QUERY_ADMIN}
	bind:variables={productsFilterVariables}
	resultKey="products"
	columns={productColumns}
	bind:forceReExecuteGraphqlQuery
/>
