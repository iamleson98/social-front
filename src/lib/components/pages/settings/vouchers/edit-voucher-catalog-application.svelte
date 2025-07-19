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
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
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
	import { checkIfGraphqlResultHasError, toggleItemNoDup } from '$lib/utils/utils';
	import { TABS, type TabName } from './consts';
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
			title: 'Select',
			child: catalogAssignSelect,
		},
	];

	const CatalogUnassignSelectCol: TableColumnProps<any>[] = [
		{
			title: 'Select',
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
		voucherId: page.params.id,
		first: FIRST_100,
	});
	/** re-executing lock, for query existing products, variants, collections, categories of current voucher */
	let forceReExecuteGraphqlQuery = $state(true);
	let catalogQueryValue = $state('');
	/** in the modal for assigning products, variants, categories, collections, each of them we have 1 graphql table. This lock controls query fetching of them */
	let forceReExecuteCatalogQuery = $state(true);
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

	const handleCatalogQueryChange = async () => {
		if (!activeTab) return;

		const trimQueryValue = catalogQueryValue.trim();
		if (activeTab === 'categories') queryCategoriesVariables.filter!.search = trimQueryValue;
		else if (activeTab === 'collections') queryCollectionsVariables.filter!.search = trimQueryValue;
		else if (activeTab === 'products') queryProductsVariables.filter!.search = trimQueryValue;
		else queryProductsVariables.filter!.search = trimQueryValue;

		forceReExecuteCatalogQuery = true;
	};

	afterNavigate(() => {
		voucherRelationVars = {
			voucherId: page.params.id,
			first: FIRST_100,
		};
		forceReExecuteGraphqlQuery = true;
	});

	const handleUnassignItems = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'voucherCataloguesRemove'>,
			MutationVoucherCataloguesRemoveArgs
		>(VOUCHER_CATALOGUES_REMOVE_MUTATION, {
			id: page.params.id,
			input: {
				products: activeTab === 'products' ? removeProducts : [],
				collections: activeTab === 'collections' ? removeCollections : [],
				categories: activeTab === 'categories' ? removeCategories : [],
				variants: activeTab === 'variants' ? removeVariants : [],
			},
		});
		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'voucherCataloguesRemove',
				$tranFunc('common.editSuccess'),
			)
		)
			return;

		removeProducts = [];
		removeCollections = [];
		removeCategories = [];
		removeVariants = [];
		forceReExecuteGraphqlQuery = true; // force re-execute graphql query to update table
	};

	const handleAssignItems = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'voucherCataloguesAdd'>,
			MutationVoucherCataloguesAddArgs
		>(VOUCHER_CATALOGUES_ADD_MUTATION, {
			id: page.params.id,
			input: {
				products: activeTab === 'products' ? addProducts : [],
				collections: activeTab === 'collections' ? addCollections : [],
				categories: activeTab === 'categories' ? addCategories : [],
				variants: activeTab === 'variants' ? addVariants : [],
			},
		});
		loading = false;

		if (
			checkIfGraphqlResultHasError(result, 'voucherCataloguesAdd', $tranFunc('common.editSuccess'))
		)
			return;

		addProducts = [];
		addCollections = [];
		addCategories = [];
		addVariants = [];
		forceReExecuteGraphqlQuery = true; // force re-execute graphql query to update table
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
	{#each TABS as tab, idx (idx)}
		<a
			role="tab"
			class="tab"
			class:tab-active={activeTab === tab}
			href="?tab={tab}"
			data-sveltekit-noscroll
		>
			{tab}
		</a>
	{/each}
</div>

{#snippet commonHeader(name: string)}
	<SectionHeader>
		<span>Eligible {name}</span>
		<div class="flex gap-1">
			<Button
				size="xs"
				variant="light"
				color="red"
				endIcon={Trash}
				disabled={disabled ||
					loading ||
					(activeTab === 'categories' && removeCategories.length === 0) ||
					(activeTab === 'collections' && removeCollections.length === 0) ||
					(activeTab === 'products' && removeProducts.length === 0) ||
					(activeTab === 'variants' && removeVariants.length === 0)}
				onclick={handleUnassignItems}
			>
				Unassign {name}
			</Button>
			<Button
				size="xs"
				variant="light"
				onclick={() => {
					openAssignCatalogFeature = true;
					forceReExecuteCatalogQuery = true;
				}}
				{disabled}
				endIcon={Plus}
			>
				Assign {name}
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
			query={VOUCHER_COLLECTIONS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.collections' as keyof Query}
			disabled={disabled || loading}
			columns={CatalogUnassignSelectCol.concat(COLLECTION_COLUMNS)}
		/>
	{:else if activeTab === 'products'}
		<GraphqlPaginableTable
			query={VOUCHER_PRODUCTS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			disabled={disabled || loading}
			resultKey={'voucher.products' as keyof Query}
			columns={CatalogUnassignSelectCol.concat(PRODUCT_COLUMNS)}
		/>
	{:else if activeTab === 'categories'}
		<GraphqlPaginableTable
			query={VOUCHER_CATEGORIES_QUERY}
			bind:variables={voucherRelationVars}
			disabled={disabled || loading}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.categories' as keyof Query}
			columns={CatalogUnassignSelectCol.concat(CATEGORY_COLUMNS)}
		/>
	{:else if activeTab === 'variants'}
		<GraphqlPaginableTable
			query={VOUCHER_VARIANTS_QUERY}
			disabled={disabled || loading}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.variants' as keyof Query}
			columns={CatalogUnassignSelectCol.concat(VARIANT_COLUMNS)}
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
	onOk={handleAssignItems}
	disableElements={disabled || loading}
>
	<Input
		placeholder="Enter query"
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
			columns={SelectCol.concat(CATEGORY_COLUMNS)}
			query={CATEGORIES_LIST_QUERY_STORE}
			resultKey="categories"
			bind:variables={queryCategoriesVariables}
			bind:forceReExecuteGraphqlQuery={forceReExecuteCatalogQuery}
			disabled={disabled || loading}
		/>
	{:else if activeTab === 'collections'}
		<GraphqlPaginableTable
			columns={SelectCol.concat(COLLECTION_COLUMNS)}
			query={COLLECTIONS_QUERY}
			resultKey="collections"
			bind:variables={queryCollectionsVariables}
			bind:forceReExecuteGraphqlQuery={forceReExecuteCatalogQuery}
			disabled={disabled || loading}
		/>
	{:else if activeTab === 'products'}
		<GraphqlPaginableTable
			columns={SelectCol.concat(PRODUCT_COLUMNS)}
			query={PRODUCT_LIST_QUERY}
			resultKey="products"
			bind:variables={queryProductsVariables}
			bind:forceReExecuteGraphqlQuery={forceReExecuteCatalogQuery}
			disabled={disabled || loading}
		/>
	{:else if activeTab === 'variants'}
		<GraphqlPaginableTable
			columns={SelectCol.concat(VARIANT_COLUMNS)}
			query={PRODUCT_VARIANTS_QUERY}
			resultKey="productVariants"
			bind:variables={queryVariantsVariables}
			bind:forceReExecuteGraphqlQuery={forceReExecuteCatalogQuery}
			disabled={disabled || loading}
		/>
	{/if}
</Modal>
