<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		CATEGORIES_LIST_QUERY_STORE,
		PRODUCT_LIST_QUERY,
		PRODUCT_VARIANTS_QUERY,
	} from '$lib/api';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Search } from '$lib/components/icons';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import {
		GraphqlPaginableTable,
		reFetchTableData,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import { TableNameKeys } from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import {
		type QueryCategoriesArgs,
		type QueryCollectionsArgs,
		type QueryProductsArgs,
		type QueryProductVariantsArgs,
	} from '$lib/gql/graphql';
	import { toggleItemNoDup } from '$lib/utils/utils';
	import { TABS_OPTIONS, type TabName } from './consts';
	import {
		CATEGORY_COLUMNS,
		COLLECTION_COLUMNS,
		PRODUCT_COLUMNS,
		VARIANT_COLUMNS,
	} from './snippets.svelte';

	type Props = {
		disabled?: boolean;
		loading?: boolean;
		addCategories: string[];
		addCollections: string[];
		addProducts: string[];
		addVariants: string[];
	};

	let {
		disabled,
		loading,
		addCategories = $bindable(),
		addCollections = $bindable(),
		addProducts = $bindable(),
		addVariants = $bindable(),
	}: Props = $props();
	let activeTab = $derived(page.url.searchParams.get('tab') as TabName);

	/**  catalog item select checkbox */
	const SelectCol: TableColumnProps<any>[] = [
		{
			title: $tranFunc('common.select'),
			child: catalogAssignSelect,
		},
	];

	const FIRST_10 = 10;

	let queryCategoriesVariables = $state<QueryCategoriesArgs>({
		first: FIRST_10,
		filter: { search: '' },
	});
	let queryCollectionsVariables = $state<QueryCollectionsArgs>({
		first: FIRST_10,
		filter: { search: '' },
	});
	let queryProductsVariables = $state<QueryProductsArgs>({
		first: FIRST_10,
		filter: { search: '' },
	});
	let queryVariantsVariables = $state<QueryProductVariantsArgs>({
		first: FIRST_10,
		filter: { search: '' },
	});
	let catalogQueryValue = $state('');

	const forceReExecuteCatalogQuery = () => {
		reFetchTableData(TableNameKeys.NewVoucherCategoryTableName);
		reFetchTableData(TableNameKeys.NewVoucherCollectionTableName);
		reFetchTableData(TableNameKeys.NewVoucherProductTableName);
		reFetchTableData(TableNameKeys.NewVoucherVariantTableName);
	};

	const handleCatalogQueryChange = async () => {
		if (!activeTab) return;

		const trimQueryValue = catalogQueryValue.trim();
		if (activeTab === 'categories') queryCategoriesVariables.filter!.search = trimQueryValue;
		else if (activeTab === 'collections') queryCollectionsVariables.filter!.search = trimQueryValue;
		else if (activeTab === 'products') queryProductsVariables.filter!.search = trimQueryValue;
		else queryProductsVariables.filter!.search = trimQueryValue;

		forceReExecuteCatalogQuery();
	};

	afterNavigate(async () => {
		catalogQueryValue = '';
		await handleCatalogQueryChange();
	});
</script>

{#snippet commonHeader(name: TabName)}
	{@const tabTran = $TABS_OPTIONS.find((item) => item.value === name)}
	<SectionHeader>
		<span>{tabTran?.eligibleLabel}</span>
	</SectionHeader>
{/snippet}

{#snippet catalogAssignSelect({ item }: { item: any })}
	<Checkbox
		size="sm"
		disabled={disabled || loading}
		checked={(activeTab === 'categories' && addCategories.includes(item.id)) ||
			(activeTab === 'collections' && addCollections.includes(item.id)) ||
			(activeTab === 'products' && addProducts.includes(item.id)) ||
			(activeTab === 'variants' && addVariants.includes(item.id))}
		onchange={(evt) => {
			if (activeTab === 'categories')
				addCategories = toggleItemNoDup(addCategories, item.id, evt.currentTarget.checked);
			else if (activeTab === 'collections')
				addCollections = toggleItemNoDup(addCollections, item.id, evt.currentTarget.checked);
			else if (activeTab === 'products')
				addProducts = toggleItemNoDup(addProducts, item.id, evt.currentTarget.checked);
			else if (activeTab === 'variants')
				addVariants = toggleItemNoDup(addVariants, item.id, evt.currentTarget.checked);
		}}
	/>
{/snippet}

<div class="space-y-2">
	<div role="tablist" class="tabs tabs-border">
		{#each $TABS_OPTIONS as tab, idx (idx)}
			<a
				role="tab"
				class="tab"
				class:tab-active={activeTab === tab.value}
				href="?tab={tab.value}"
				data-sveltekit-noscroll
			>
				{tab.label}
			</a>
		{/each}
	</div>
	{#if activeTab}
		{@render commonHeader(activeTab)}
	{/if}

	{#if !!activeTab}
		<Input
			placeholder={$tranFunc('common.search')}
			class="mb-1.5"
			bind:value={catalogQueryValue}
			inputDebounceOption={{
				debounceTime: 888,
				onInput: handleCatalogQueryChange,
			}}
			disabled={disabled || loading}
			startIcon={Search}
		/>

		{#if activeTab === 'categories'}
			<GraphqlPaginableTable
				autoRefetchOnPaginationParamsChange
				columns={SelectCol.concat(
					CATEGORY_COLUMNS(
						$tranFunc('common.pic'),
						$tranFunc('product.cateName'),
						$tranFunc('collection.noOfPrds'),
					),
				)}
				query={CATEGORIES_LIST_QUERY_STORE}
				resultKey="categories"
				bind:variables={queryCategoriesVariables}
				tableName={TableNameKeys.NewVoucherCategoryTableName}
				disabled={disabled || loading}
			/>
		{:else if activeTab === 'collections'}
			<GraphqlPaginableTable
				autoRefetchOnPaginationParamsChange
				columns={SelectCol.concat(
					COLLECTION_COLUMNS(
						$tranFunc('common.pic'),
						$tranFunc('common.name'),
						$tranFunc('collection.noOfPrds'),
					),
				)}
				query={COLLECTIONS_QUERY}
				resultKey="collections"
				bind:variables={queryCollectionsVariables}
				tableName={TableNameKeys.NewVoucherCollectionTableName}
				disabled={disabled || loading}
			/>
		{:else if activeTab === 'products'}
			<GraphqlPaginableTable
				autoRefetchOnPaginationParamsChange
				columns={SelectCol.concat(
					PRODUCT_COLUMNS(
						$tranFunc('common.pic'),
						$tranFunc('product.prdName'),
						$tranFunc('product.prdType'),
						$tranFunc('settings.availability'),
					),
				)}
				query={PRODUCT_LIST_QUERY}
				resultKey="products"
				bind:variables={queryProductsVariables}
				tableName={TableNameKeys.NewVoucherProductTableName}
				disabled={disabled || loading}
			/>
		{:else if activeTab === 'variants'}
			<GraphqlPaginableTable
				autoRefetchOnPaginationParamsChange
				columns={SelectCol.concat(
					VARIANT_COLUMNS(
						$tranFunc('common.pic'),
						$tranFunc('product.prdName'),
						$tranFunc('product.variantName'),
					),
				)}
				query={PRODUCT_VARIANTS_QUERY}
				resultKey="productVariants"
				bind:variables={queryVariantsVariables}
				tableName={TableNameKeys.NewVoucherVariantTableName}
				disabled={disabled || loading}
			/>
		{/if}
	{/if}
</div>
