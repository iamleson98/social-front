<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import {
		CATEGORIES_LIST_QUERY_STORE,
		PRODUCT_LIST_QUERY,
		PRODUCT_VARIANTS_QUERY,
	} from '$lib/api';
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
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
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
		QueryProductVariantsArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { stringSlicer, toggleItemNoDup } from '$lib/utils/utils';

	type Props = {
		existingCategoriesCount: number;
		existingCollectionsCount: number;
		existingVariantsCount: number;
		existingProductsCount: number;
		newCategories: string[];
		newProducts: string[];
		newCollections: string[];
		newVariants: string[];
		disabled?: boolean;
		onAssignCatalogItems: () => Promise<void>;
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
		onAssignCatalogItems,
		newCategories = $bindable(),
		newProducts = $bindable(),
		newCollections = $bindable(),
		newVariants = $bindable(),
		disabled,
	}: Props = $props();

	let activeTab = $derived(page.url.searchParams.get('tab') as TabName);
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
	/** re-executing lock, for query existing products, variants, collections, categories of current voucher */
	let forceReExecuteGraphqlQuery = $state(true);
	let catalogQueryValue = $state('');
	/** in the modal for assigning products, variants, categories, collections, each of them we have 1 graphql table. This lock controls query fetching of them */
	let forceReExecuteCatalogQuery = $state(true);
	let openAssignCatalogFeature = $state(false);
	let queryCategoriesVariables = $state<QueryCategoriesArgs>({ first: 10, filter: { search: '' } });
	let queryCollectionsVariables = $state<QueryCollectionsArgs>({
		first: 10,
		filter: { search: '' },
	});
	let queryProductsVariables = $state<QueryProductsArgs>({ first: 10, filter: { search: '' } });
	let queryVariantsVariables = $state<QueryProductVariantsArgs>({
		first: 10,
		filter: { search: '' },
	});

	const handleCatalogQueryChange = async () => {
		if (!activeTab) return;

		const trimQueryValue = catalogQueryValue.trim();
		if (activeTab === 'categories') queryCategoriesVariables.filter!.search = trimQueryValue;
		else if (activeTab === 'collections') queryCollectionsVariables.filter!.search = trimQueryValue;
		else if (activeTab === 'products') queryProductsVariables.filter!.search = trimQueryValue;
		else queryProductsVariables.filter!.search = trimQueryValue;

		forceReExecuteCatalogQuery = true;
	};

	const SelectCol: TableColumnProps<any>[] = [
		{
			title: 'Select',
			child: select,
		},
	];

	const COLLECTION_COLUMNS: TableColumnProps<Collection>[] = [
		{
			title: 'Image',
			child: collectionImage,
		},
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
	<a href={AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(item.id)} class="link">
		{item.name}
	</a>
{/snippet}

{#snippet collectionProducts({ item }: { item: Collection })}
	<span>{item.products?.totalCount || '-'}</span>
{/snippet}

<!-- Product -->
{#snippet prdName({ item }: { item: Product })}
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)} class="link">
		{stringSlicer(item.name, 40)}
	</a>
{/snippet}

{#snippet prdImage({ item }: { item: Product })}
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} size="sm" />
{/snippet}

{#snippet collectionImage({ item }: { item: Collection })}
	<Thumbnail
		src={item.backgroundImage?.url}
		alt={item.backgroundImage?.alt || item.name}
		size="sm"
	/>
{/snippet}

{#snippet productType({ item }: { item: Product })}
	<span>{item.productType?.name}</span>
{/snippet}

{#snippet select({ item }: { item: any })}
	<Checkbox
		size="sm"
		{disabled}
		checked={(activeTab === 'categories' && newCategories.includes(item.id)) ||
			(activeTab === 'collections' && newCollections.includes(item.id)) ||
			(activeTab === 'products' && newProducts.includes(item.id)) ||
			(activeTab === 'variants' && newVariants.includes(item.id))}
		onchange={(evt) => {
			if (activeTab === 'categories')
				newCategories = toggleItemNoDup(newCategories, item.id, evt.currentTarget.checked);
			else if (activeTab === 'collections')
				newCollections = toggleItemNoDup(newCollections, item.id, evt.currentTarget.checked);
			else if (activeTab === 'products')
				newProducts = toggleItemNoDup(newProducts, item.id, evt.currentTarget.checked);
			else if (activeTab === 'variants')
				newVariants = toggleItemNoDup(newVariants, item.id, evt.currentTarget.checked);
		}}
	/>
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
	<a href={AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(item.id)} class="link">
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
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.product.slug)} class="link">
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
		<Button
			size="xs"
			variant="light"
			onclick={() => {
				openAssignCatalogFeature = true;
				forceReExecuteCatalogQuery = true;
			}}
			{disabled}
		>
			Assign {name}
		</Button>
	</SectionHeader>
{/snippet}

<div>
	{#if activeTab}
		{@render commonHeader(activeTab)}
	{/if}

	{#if activeTab === 'collections'}
		<GraphqlPaginableTable
			query={VOUCHER_COLLECTIONS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.collections' as keyof Query}
			{disabled}
			columns={COLLECTION_COLUMNS}
		/>
	{:else if activeTab === 'products'}
		<GraphqlPaginableTable
			query={VOUCHER_PRODUCTS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			{disabled}
			resultKey={'voucher.products' as keyof Query}
			columns={PRODUCT_COLUMNS}
		/>
	{:else if activeTab === 'categories'}
		<GraphqlPaginableTable
			query={VOUCHER_CATEGORIES_QUERY}
			bind:variables={voucherRelationVars}
			{disabled}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.categories' as keyof Query}
			columns={CATEGORY_COLUMNS}
		/>
	{:else if activeTab === 'variants'}
		<GraphqlPaginableTable
			query={VOUCHER_VARIANTS_QUERY}
			{disabled}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.variants' as keyof Query}
			columns={VARIANT_COLUMNS}
		/>
	{/if}
</div>

<Modal
	open={openAssignCatalogFeature}
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (openAssignCatalogFeature = false)}
	header="Assign {activeTab}"
	onCancel={() => (openAssignCatalogFeature = false)}
	size="sm"
	onOk={async () => {
		await onAssignCatalogItems();
		openAssignCatalogFeature = false;
	}}
	disableElements={disabled}
>
	<Input
		placeholder="Enter query"
		class="mb-1.5"
		bind:value={catalogQueryValue}
		inputDebounceOption={{
			debounceTime: 888,
			onInput: handleCatalogQueryChange,
		}}
		{disabled}
	/>
	{#if activeTab === 'categories'}
		<GraphqlPaginableTable
			columns={SelectCol.concat(CATEGORY_COLUMNS)}
			query={CATEGORIES_LIST_QUERY_STORE}
			resultKey="categories"
			bind:variables={queryCategoriesVariables}
			bind:forceReExecuteGraphqlQuery={forceReExecuteCatalogQuery}
			{disabled}
		/>
	{:else if activeTab === 'collections'}
		<GraphqlPaginableTable
			columns={SelectCol.concat(COLLECTION_COLUMNS)}
			query={COLLECTIONS_QUERY}
			resultKey="collections"
			bind:variables={queryCollectionsVariables}
			bind:forceReExecuteGraphqlQuery={forceReExecuteCatalogQuery}
			{disabled}
		/>
	{:else if activeTab === 'products'}
		<GraphqlPaginableTable
			columns={SelectCol.concat(PRODUCT_COLUMNS)}
			query={PRODUCT_LIST_QUERY}
			resultKey="products"
			bind:variables={queryProductsVariables}
			bind:forceReExecuteGraphqlQuery={forceReExecuteCatalogQuery}
			{disabled}
		/>
	{:else if activeTab === 'variants'}
		<GraphqlPaginableTable
			columns={SelectCol.concat(VARIANT_COLUMNS)}
			query={PRODUCT_VARIANTS_QUERY}
			resultKey="productVariants"
			bind:variables={queryVariantsVariables}
			bind:forceReExecuteGraphqlQuery={forceReExecuteCatalogQuery}
			{disabled}
		/>
	{/if}
</Modal>
