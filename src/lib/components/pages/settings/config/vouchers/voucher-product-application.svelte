<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import {
		VOUCHER_CATEGORIES_QUERY,
		VOUCHER_COLLECTIONS_QUERY,
		VOUCHER_PRODUCTS_QUERY,
		VOUCHER_VARIANTS_QUERY,
	} from '$lib/api/admin/discount';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type {
		Category,
		CategoryCountableConnection,
		Collection,
		CollectionCountableConnection,
		Product,
		ProductCountableConnection,
		ProductVariant,
		ProductVariantCountableConnection,
		Query,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { stringSlicer } from '$lib/utils/utils';

	type Props = {
		categories?: CategoryCountableConnection | null;
		products?: ProductCountableConnection | null;
		collections?: CollectionCountableConnection | null;
		variants?: ProductVariantCountableConnection | null;
	};

	type TabName = 'categories' | 'products' | 'collections' | 'variants';
	type TabProps = {
		name: TabName;
		count: number;
	};

	let { categories, products, collections, variants }: Props = $props();

	let activeTab = $derived(page.url.searchParams.get('tab'));
	const TABS: TabProps[] = [
		{
			name: 'categories',
			count: categories?.totalCount || 0,
		},
		{
			name: 'products',
			count: products?.totalCount || 0,
		},
		{
			name: 'collections',
			count: collections?.totalCount || 0,
		},
		{
			name: 'variants',
			count: variants?.totalCount || 0,
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

	afterNavigate(() => {
		voucherRelationVars = {
			voucherId: page.params.id,
			first: 10,
		};
		forceReExecuteGraphqlQuery = true;
	});
</script>

<!-- Collection -->

{#snippet name({ item }: { item: Collection })}
	<a href={AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(item.id)} class="link link-hover"
		>{item.name}</a
	>
{/snippet}

{#snippet collectionProducts({ item }: { item: Collection })}
	<span>{item.products?.totalCount || '-'}</span>
{/snippet}

<!-- Product -->

{#snippet prdName({ item }: { item: Product })}
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)} class="link link-hover"
		>{stringSlicer(item.name, 40)}</a
	>
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
	<a href={AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(item.id)} class="link link-hover"
		>{item.name}</a
	>
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
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.product.slug)} class="link link-hover"
		>{stringSlicer(item.product.name, 40)}</a
	>
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
			data-sveltekit-noscroll>{tab.name} ({tab.count})</a
		>
	{/each}
</div>

<div>
	{#if activeTab === 'collections'}
		<SectionHeader>
			<span>Eligible Collections</span>
			<Button size="xs" variant="light">Assign collections</Button>
		</SectionHeader>

		<GraphqlPaginableTable
			query={VOUCHER_COLLECTIONS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.collections' as keyof Query}
			columns={COLLECTION_COLUMNS}
		/>
	{:else if activeTab === 'products'}
		<SectionHeader>
			<span>Eligible Products</span>
			<Button size="xs" variant="light">Assign products</Button>
		</SectionHeader>

		<GraphqlPaginableTable
			query={VOUCHER_PRODUCTS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.products' as keyof Query}
			columns={PRODUCT_COLUMNS}
		/>
	{:else if activeTab === 'categories'}
		<SectionHeader>
			<span>Eligible Categories</span>
			<Button size="xs" variant="light">Assign categories</Button>
		</SectionHeader>

		<GraphqlPaginableTable
			query={VOUCHER_CATEGORIES_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.categories' as keyof Query}
			columns={CATEGORY_COLUMNS}
		/>
	{:else if activeTab === 'variants'}
		<SectionHeader>
			<span>Eligible Variants</span>
			<Button size="xs" variant="light">Assign variants</Button>
		</SectionHeader>

		<GraphqlPaginableTable
			query={VOUCHER_VARIANTS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.variants' as keyof Query}
			columns={VARIANT_COLUMNS}
		/>
	{/if}
</div>
