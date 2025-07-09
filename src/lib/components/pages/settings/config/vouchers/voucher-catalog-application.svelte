<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { CATEGORIES_LIST_QUERY_STORE, PRODUCT_LIST_QUERY_STORE } from '$lib/api';
	import {
		VOUCHER_CATEGORIES_QUERY,
		VOUCHER_COLLECTIONS_QUERY,
		VOUCHER_PRODUCTS_QUERY,
		VOUCHER_VARIANTS_QUERY,
	} from '$lib/api/admin/discount';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type {
		Category,
		Collection,
		Product,
		ProductVariant,
		Query,
		QueryCategoriesArgs,
		QueryCollectionsArgs,
		QueryProductsArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { stringSlicer } from '$lib/utils/utils';

	type Props = {
		existingCategoriesCount: number;
		existingCollectionsCount: number;
		existingVariantsCount: number;
		existingProductsCount: number;

		newCategories: string[];
		newProducts: string[];
		newCollections: string[];
		newVariants: string[];
	};

	type TabName = 'categories' | 'products' | 'collections' | 'variants';
	type TabProps = {
		name: TabName;
		count: number;
	};

	let {
		existingCategoriesCount,
		existingCollectionsCount,
		existingProductsCount,
		existingVariantsCount,

		newCategories = $bindable(),
		newProducts = $bindable(),
		newCollections = $bindable(),
		newVariants = $bindable(),
	}: Props = $props();

	let activeTab = $derived(page.url.searchParams.get('tab'));
	const TABS: TabProps[] = [
		{
			name: 'categories',
			count: existingCategoriesCount,
		},
		{
			name: 'products',
			count: existingProductsCount,
		},
		{
			name: 'collections',
			count: existingCollectionsCount,
		},
		{
			name: 'variants',
			count: existingVariantsCount,
		},
	];

	type VoucherRelationVars = {
		voucherId: string;
		first?: number;
		after?: string;
		last?: number;
		before?: string;
	};

	let voucherRelationVars = $state<VoucherRelationVars>({
		voucherId: page.params.id,
		first: 10,
	});
	let forceReExecuteGraphqlQuery = $state(true);
	let openAssignCatalogFeature = $state(false);

	const COLLECTION_COLUMNS: TableColumnProps<Collection>[] = [
		{
			title: 'Name',
			child: name,
		},
		{
			title: 'No. of products',
			child: collectionProducts,
		},
	];

	const PRODUCT_COLUMNS: TableColumnProps<Product>[] = [
		{
			title: 'Image',
			child: prdImage,
		},
		{
			title: 'Name',
			child: prdName,
		},
		{
			title: 'Product type',
			child: productType,
		},
		{
			title: 'Availability',
			child: availability,
		},
	];

	const CATEGORY_COLUMNS: TableColumnProps<Category>[] = [
		{
			title: 'Image',
			child: categoryImage,
		},
		{
			title: 'Name',
			child: categoryName,
		},
		{
			title: 'No. of products',
			child: categoryNoOfProducts,
		},
	];

	const VARIANT_COLUMNS: TableColumnProps<ProductVariant>[] = [
		{
			title: 'Image',
			child: variantImage,
		},
		{
			title: 'Product name',
			child: variantPrdName,
		},
		{
			title: 'Variant name',
			child: variantName,
		},
	];

	afterNavigate(({ from, to }) => {
		voucherRelationVars = {
			voucherId: page.params.id,
			first: 10,
		};
		forceReExecuteGraphqlQuery = true;

		if (from !== to) openAssignCatalogFeature = false;
	});
</script>

<!-- Collection -->
{#snippet name({ item }: { item: Collection })}
	<a href={AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(item.id)} class="link link-hover">
		{item.name}
	</a>
{/snippet}

{#snippet collectionProducts({ item }: { item: Collection })}
	<span>{item.products?.totalCount || '-'}</span>
{/snippet}

<!-- Product -->
{#snippet prdName({ item }: { item: Product })}
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)} class="link link-hover">
		{stringSlicer(item.name, 40)}
	</a>
{/snippet}

{#snippet prdImage({ item }: { item: Product })}
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} size="sm" />
{/snippet}

{#snippet productType({ item }: { item: Product })}
	<span>{item.productType?.name}</span>
{/snippet}

{#snippet availability({ item }: { item: Product })}
	<Badge
		text={`${item.channelListings?.length} channels`}
		color={item.channelListings?.length ? 'green' : 'red'}
		class="tooltip tooltip-top"
		data-tip={item.channelListings?.map((item) => item.channel.name).join(', ') || 'No channels'}
	/>
{/snippet}

<!-- Category -->
{#snippet categoryName({ item }: { item: Category })}
	<a href={AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(item.id)} class="link link-hover">
		{item.name}
	</a>
{/snippet}

{#snippet categoryNoOfProducts({ item }: { item: Category })}
	<span>{item.products?.totalCount || '-'}</span>
{/snippet}

{#snippet categoryImage({ item }: { item: Category })}
	<Thumbnail
		src={item.backgroundImage?.url}
		alt={item.backgroundImage?.alt || item.name}
		size="sm"
	/>
{/snippet}

<!-- Variant -->
{#snippet variantPrdName({ item }: { item: ProductVariant })}
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.product.slug)} class="link link-hover">
		{stringSlicer(item.product.name, 40)}
	</a>
{/snippet}

{#snippet variantImage({ item }: { item: ProductVariant })}
	<Thumbnail
		src={item.product.thumbnail?.url}
		alt={item.product.thumbnail?.alt || item.product.name}
		size="sm"
	/>
{/snippet}

{#snippet variantName({ item }: { item: ProductVariant })}
	<span>{item.name}</span>
{/snippet}

<div role="tablist" class="tabs tabs-border">
	{#each TABS as tab, idx (idx)}
		<a
			role="tab"
			class="tab"
			class:tab-active={activeTab === tab.name}
			href="?tab={tab.name}"
			data-sveltekit-noscroll
		>
			{tab.name} ({tab.count})
		</a>
	{/each}
</div>

{#snippet commonHeader(name: string)}
	<SectionHeader>
		<span>Eligible {name}</span>
		<Button size="xs" variant="light" onclick={() => (openAssignCatalogFeature = true)}>
			Assign {name}
		</Button>
	</SectionHeader>
{/snippet}

<div>
	{#if activeTab}
		{@render commonHeader(activeTab)}
	{/if}

	{#if activeTab === 'collections'}
		{#if openAssignCatalogFeature}
			<GraphqlPaginableSelect
				query={COLLECTIONS_QUERY}
				resultKey="collections"
				variableSearchQueryPath="filter.search"
				variables={{ first: 20, filter: { search: '' } } as QueryCollectionsArgs}
				optionValueKey="id"
				optionLabelKey="name"
				multiple
				label="Select collections to apply for this voucher"
				size="sm"
				class="mb-2"
				bind:value={newCollections}
			/>
		{/if}

		<GraphqlPaginableTable
			query={VOUCHER_COLLECTIONS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.collections' as keyof Query}
			columns={COLLECTION_COLUMNS}
		/>
	{:else if activeTab === 'products'}
		{#if openAssignCatalogFeature}
			<GraphqlPaginableSelect
				query={PRODUCT_LIST_QUERY_STORE}
				resultKey="products"
				variableSearchQueryPath="filter.search"
				variables={{ first: 20, filter: { search: '' } } as QueryProductsArgs}
				optionValueKey="id"
				optionLabelKey="name"
				multiple
				label="Select products to apply for this voucher"
				size="sm"
				class="mb-2"
				bind:value={newProducts}
			/>
		{/if}

		<GraphqlPaginableTable
			query={VOUCHER_PRODUCTS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.products' as keyof Query}
			columns={PRODUCT_COLUMNS}
		/>
	{:else if activeTab === 'categories'}
		{#if openAssignCatalogFeature}
			<GraphqlPaginableSelect
				query={CATEGORIES_LIST_QUERY_STORE}
				resultKey="categories"
				variableSearchQueryPath="filter.search"
				variables={{ first: 20, filter: { search: '' } } as QueryCategoriesArgs}
				optionValueKey="id"
				optionLabelKey="name"
				multiple
				label="Select categories to apply for this voucher"
				size="sm"
				class="mb-2"
				bind:value={newCategories}
			/>
		{/if}

		<GraphqlPaginableTable
			query={VOUCHER_CATEGORIES_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.categories' as keyof Query}
			columns={CATEGORY_COLUMNS}
		/>
	{:else if activeTab === 'variants'}
		<GraphqlPaginableTable
			query={VOUCHER_VARIANTS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.variants' as keyof Query}
			columns={VARIANT_COLUMNS}
		/>
	{/if}
</div>
