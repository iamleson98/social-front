<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		CATEGORIES_LIST_QUERY_STORE,
		PRODUCT_LIST_QUERY,
		PRODUCT_VARIANTS_QUERY,
	} from '$lib/api';
	import {
		VOUCHER_CATALOGUES_ADD_MUTATION,
		VOUCHER_CATALOGUES_REMOVE_MUTATION,
		VOUCHER_CATEGORIES_QUERY,
		VOUCHER_COLLECTIONS_QUERY,
		VOUCHER_PRODUCTS_QUERY,
		VOUCHER_VARIANTS_QUERY,
	} from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Search, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		GraphqlPaginableTable,
		reFetchTableData,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import { TableNameKeys } from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import type {
		Mutation,
		MutationVoucherCataloguesAddArgs,
		MutationVoucherCataloguesRemoveArgs,
		Query,
		QueryCategoriesArgs,
		QueryCollectionsArgs,
		QueryProductsArgs,
		QueryProductVariantsArgs,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, toggleItemNoDup } from '$lib/utils/utils';
	import { TABS_OPTIONS, type TabName } from './consts';
	import {
		CATEGORY_COLUMNS,
		COLLECTION_COLUMNS,
		PRODUCT_COLUMNS,
		VARIANT_COLUMNS,
	} from './snippets.svelte';

	type Props = {
		disabled?: boolean;
		onAssignCatalogItems?: () => Promise<void>;
	};

	let { disabled }: Props = $props();

	let activeTab = $derived(page.url.searchParams.get('tab') as TabName);

	/**  catalog item select checkbox */
	const SelectCol: TableColumnProps<any>[] = [
		{
			title: $tranFunc('common.select'),
			child: catalogAssignSelect,
		},
	];

	const CatalogUnassignSelectCol: TableColumnProps<any>[] = [
		{
			title: $tranFunc('common.select'),
			child: catalogUnassignSelect,
		},
	];

	type VoucherRelationVars = {
		voucherId: string;
		first?: number;
		after?: string;
		last?: number;
		before?: string;
	};

	const FIRST_100 = 100;
	const FIRST_10 = 10;

	let voucherRelationVars = $state<VoucherRelationVars>({
		voucherId: page.params.id!,
		first: FIRST_100,
	});
	/** re-executing lock, for query existing products, variants, collections, categories of current voucher */
	// let forceReExecuteGraphqlQuery = $state(true);
	let catalogQueryValue = $state('');
	/** in the modal for assigning products, variants, categories, collections, each of them we have 1 graphql table. This lock controls query fetching of them */
	// let forceReExecuteCatalogQuery = $state(true);
	let openAssignCatalogFeature = $state(false);
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

	/**
	 * Those are used when the voucher existed, you want to assign new items
	 */
	let addProducts = $state.raw<string[]>([]);
	let addCollections = $state.raw<string[]>([]);
	let addCategories = $state.raw<string[]>([]);
	let addVariants = $state.raw<string[]>([]);

	let removeProducts = $state.raw<string[]>([]);
	let removeCollections = $state.raw<string[]>([]);
	let removeCategories = $state.raw<string[]>([]);
	let removeVariants = $state.raw<string[]>([]);
	let loading = $state(false);

	const forceRefetchCatalogueData = () => {
		reFetchTableData(TableNameKeys.CollectionListTable);
		reFetchTableData(TableNameKeys.ProductListTable);
		reFetchTableData(TableNameKeys.CategoryListTable);
		reFetchTableData(TableNameKeys.VariantListTable);
	};

	const forceRefetchVoucherCatalogueData = () => {
		reFetchTableData(TableNameKeys.VoucherProductCatalogTable);
		reFetchTableData(TableNameKeys.VoucherProductCatalogTable);
		reFetchTableData(TableNameKeys.VoucherCategoryCatalogTable);
		reFetchTableData(TableNameKeys.VoucherVariantCatalogTable);
	};

	const handleCatalogQueryChange = async () => {
		if (!activeTab) return;

		const trimQueryValue = catalogQueryValue.trim();
		if (activeTab === 'categories') queryCategoriesVariables.filter!.search = trimQueryValue;
		else if (activeTab === 'collections') queryCollectionsVariables.filter!.search = trimQueryValue;
		else if (activeTab === 'products') queryProductsVariables.filter!.search = trimQueryValue;
		else queryProductsVariables.filter!.search = trimQueryValue;

		forceRefetchCatalogueData();
	};

	afterNavigate(() => {
		voucherRelationVars = {
			voucherId: page.params.id!,
			first: FIRST_100,
		};
		forceRefetchVoucherCatalogueData();
	});

	const handleUnassignItems = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'voucherCataloguesRemove'>,
			MutationVoucherCataloguesRemoveArgs
		>(VOUCHER_CATALOGUES_REMOVE_MUTATION, {
			id: page.params.id!,
			input: {
				products: activeTab === 'products' ? removeProducts : [],
				collections: activeTab === 'collections' ? removeCollections : [],
				categories: activeTab === 'categories' ? removeCategories : [],
				variants: activeTab === 'variants' ? removeVariants : [],
			},
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'voucherCataloguesRemove', $CommonState.EditSuccess))
			return;

		removeProducts = [];
		removeCollections = [];
		removeCategories = [];
		removeVariants = [];
		forceRefetchVoucherCatalogueData(); // force re-execute graphql query to update table
	};

	const handleAssignItems = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'voucherCataloguesAdd'>,
			MutationVoucherCataloguesAddArgs
		>(VOUCHER_CATALOGUES_ADD_MUTATION, {
			id: page.params.id!,
			input: {
				products: activeTab === 'products' ? addProducts : [],
				collections: activeTab === 'collections' ? addCollections : [],
				categories: activeTab === 'categories' ? addCategories : [],
				variants: activeTab === 'variants' ? addVariants : [],
			},
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'voucherCataloguesAdd', $CommonState.EditSuccess))
			return;

		addProducts = [];
		addCollections = [];
		addCategories = [];
		addVariants = [];
		forceRefetchVoucherCatalogueData(); // force re-execute graphql query to update table
		openAssignCatalogFeature = false;
	};
</script>

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

{#snippet catalogUnassignSelect({ item }: { item: any })}
	<Checkbox
		size="sm"
		disabled={disabled || loading}
		checked={(activeTab === 'categories' && removeCategories.includes(item.id)) ||
			(activeTab === 'collections' && removeCollections.includes(item.id)) ||
			(activeTab === 'products' && removeProducts.includes(item.id)) ||
			(activeTab === 'variants' && removeVariants.includes(item.id))}
		onchange={(evt) => {
			if (activeTab === 'categories')
				removeCategories = toggleItemNoDup(removeCategories, item.id, evt.currentTarget.checked);
			else if (activeTab === 'collections')
				removeCollections = toggleItemNoDup(removeCollections, item.id, evt.currentTarget.checked);
			else if (activeTab === 'products')
				removeProducts = toggleItemNoDup(removeProducts, item.id, evt.currentTarget.checked);
			else if (activeTab === 'variants')
				removeVariants = toggleItemNoDup(removeVariants, item.id, evt.currentTarget.checked);
		}}
	/>
{/snippet}

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

{#snippet commonHeader(name: TabName)}
	{@const tabTran = $TABS_OPTIONS.find((item) => item.value === name)}
	<SectionHeader>
		<span>{tabTran?.eligibleLabel}</span>
		<div class="flex gap-1">
			<Button
				size="xs"
				variant="light"
				color="red"
				endIcon={Trash}
				disabled={disabled ||
					loading ||
					(name === 'categories' && !removeCategories.length) ||
					(name === 'collections' && !removeCollections.length) ||
					(name === 'products' && !removeProducts.length) ||
					(name === 'variants' && !removeVariants.length)}
				onclick={handleUnassignItems}
			>
				{$tranFunc('common.unassign')}
				{tabTran?.label}
			</Button>
			<Button
				size="xs"
				variant="light"
				onclick={() => {
					openAssignCatalogFeature = true;
					forceRefetchCatalogueData();
				}}
				{disabled}
				endIcon={Plus}
			>
				{$tranFunc('common.assign')}
				{tabTran?.label}
			</Button>
		</div>
	</SectionHeader>
{/snippet}

<div>
	{#if activeTab}
		{@render commonHeader(activeTab)}
	{/if}

	{#if activeTab === 'collections'}
		<GraphqlPaginableTable
			autoRefetchOnVariableChange
			query={VOUCHER_COLLECTIONS_QUERY}
			bind:variables={voucherRelationVars}
			tableName={TableNameKeys.VoucherCollectionCatalogTable}
			resultKey={'voucher.collections' as keyof Query}
			disabled={disabled || loading}
			columns={CatalogUnassignSelectCol.concat(
				COLLECTION_COLUMNS(
					$tranFunc('common.pic'),
					$tranFunc('common.name'),
					$tranFunc('collection.noOfPrds'),
				),
			)}
		/>
	{:else if activeTab === 'products'}
		<GraphqlPaginableTable
			autoRefetchOnVariableChange
			query={VOUCHER_PRODUCTS_QUERY}
			bind:variables={voucherRelationVars}
			tableName={TableNameKeys.VoucherProductCatalogTable}
			disabled={disabled || loading}
			resultKey={'voucher.products' as keyof Query}
			columns={CatalogUnassignSelectCol.concat(
				PRODUCT_COLUMNS(
					$tranFunc('common.pic'),
					$tranFunc('product.prdName'),
					$tranFunc('product.prdType'),
					$tranFunc('settings.availability'),
				),
			)}
		/>
	{:else if activeTab === 'categories'}
		<GraphqlPaginableTable
			autoRefetchOnVariableChange
			query={VOUCHER_CATEGORIES_QUERY}
			bind:variables={voucherRelationVars}
			disabled={disabled || loading}
			tableName={TableNameKeys.VoucherCategoryCatalogTable}
			resultKey={'voucher.categories' as keyof Query}
			columns={CatalogUnassignSelectCol.concat(
				CATEGORY_COLUMNS(
					$tranFunc('common.pic'),
					$tranFunc('product.cateName'),
					$tranFunc('collection.noOfPrds'),
				),
			)}
		/>
	{:else if activeTab === 'variants'}
		<GraphqlPaginableTable
			autoRefetchOnVariableChange
			query={VOUCHER_VARIANTS_QUERY}
			disabled={disabled || loading}
			bind:variables={voucherRelationVars}
			tableName={TableNameKeys.VoucherVariantCatalogTable}
			resultKey={'voucher.variants' as keyof Query}
			columns={CatalogUnassignSelectCol.concat(
				VARIANT_COLUMNS(
					$tranFunc('common.pic'),
					$tranFunc('product.prdName'),
					$tranFunc('product.variantName'),
				),
			)}
		/>
	{/if}
</div>

<Modal
	open={openAssignCatalogFeature}
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (openAssignCatalogFeature = false)}
	header="{$tranFunc('common.assign')} {activeTab}"
	onCancel={() => (openAssignCatalogFeature = false)}
	size="sm"
	onOk={handleAssignItems}
	disableElements={disabled || loading}
>
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
			tableName={TableNameKeys.CategoryListTable}
			disabled={disabled || loading}
		/>
	{:else if activeTab === 'collections'}
		<GraphqlPaginableTable
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
			tableName={TableNameKeys.CollectionListTable}
			disabled={disabled || loading}
		/>
	{:else if activeTab === 'products'}
		<GraphqlPaginableTable
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
			tableName={TableNameKeys.ProductListTable}
			disabled={disabled || loading}
		/>
	{:else if activeTab === 'variants'}
		<GraphqlPaginableTable
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
			tableName={TableNameKeys.VariantListTable}
			disabled={disabled || loading}
		/>
	{/if}
</Modal>
