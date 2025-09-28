<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import ProductFilterStateListener from '$lib/components/pages/home/product-filter-state-listener.svelte';
	import Filter from '$lib/components/pages/settings/products/filter.svelte';
	import Settings from '$lib/components/pages/settings/products/settings.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { Checkbox } from '$lib/components/ui/Input';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { ProductOrderField, type Product, type QueryProductsArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { formatCurrency } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { SvelteSet } from 'svelte/reactivity';

	let productsFilterVariables = $state<QueryProductsArgs>({
		first: 10,
		search: '',
		filter: {
			search: '',
		},
	});
	let forceReExecuteGraphqlQuery = $state(false);
	let selectedProducts = $state<SvelteSet<string>>(new SvelteSet());

	const productColumns: TableColumnProps<Product, ProductOrderField>[] = $derived([
		{
			title: selectAll,
			child: itemSelect,
		},
		{
			title: $tranFunc('common.pic'),
			child: pic,
		},
		{
			title: $tranFunc('settings.name'),
			child: name,
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
			key: ProductOrderField.CreatedAt,
		},
	]);
</script>

<ProductFilterStateListener />

{#snippet selectAll({ items }: { items: Product[] })}
	<Checkbox
		size="sm"
		onCheckChange={(checked) => {
			if (checked) items.forEach((item) => selectedProducts.add(item.id));
			else selectedProducts.clear();
		}}
		checked={items.length === selectedProducts.size && !!items.length}
		disabled={!items.length}
	/>
{/snippet}

{#snippet itemSelect({ item }: { item: Product })}
	<Checkbox
		size="sm"
		onCheckChange={(checked) => selectedProducts[checked ? 'add' : 'delete'](item.id)}
		checked={selectedProducts.has(item.id)}
	/>
{/snippet}

{#snippet pic({ item }: { item: Product })}
	<div class="text-center">
		<Thumbnail size="sm" src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} />
	</div>
{/snippet}

{#snippet name({ item }: { item: Product })}
	<a class="link" href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)}>{item.name}</a>
{/snippet}

{#snippet availability({ item }: { item: Product })}
	{@const tooltip = item.channelListings?.length
		? item.channelListings.map((list) => list.channel.slug).join(', ')
		: ''}
	<Badge
		text={`${item.channelListings?.length || 0} channels`}
		class="tooltip tooltip-top"
		data-tip={tooltip}
		color="green"
	/>
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
	<span class="whitespace-nowrap">{dayjs(item.created).format(SitenameTimeFormat)}</span>
{/snippet}

<div class="flex items-center justify-between mb-2">
	<Filter bind:variables={productsFilterVariables} bind:forceReExecuteGraphqlQuery />
	<Settings bind:variables={productsFilterVariables} bind:selectedIds={selectedProducts} />
</div>

<GraphqlPaginableTable
	query={PRODUCT_LIST_QUERY_ADMIN}
	bind:variables={productsFilterVariables}
	resultKey="products"
	columns={productColumns}
	bind:forceReExecuteGraphqlQuery
/>
