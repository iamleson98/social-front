<script lang="ts">
	import { page } from '$app/state';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { TABS, type TabName } from './consts';
	import { toggleItemNoDup } from '$lib/utils/utils';
	import {
		type QueryCategoriesArgs,
		type QueryCollectionsArgs,
		type QueryProductsArgs,
		type QueryProductVariantsArgs,
	} from '$lib/gql/graphql';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import {
		CATEGORIES_LIST_QUERY_STORE,
		PRODUCT_LIST_QUERY,
		PRODUCT_VARIANTS_QUERY,
	} from '$lib/api';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import {
		CATEGORY_COLUMNS,
		COLLECTION_COLUMNS,
		PRODUCT_COLUMNS,
		VARIANT_COLUMNS,
	} from './snippets.svelte';
	import { Search } from '$lib/components/icons';
	import { afterNavigate } from '$app/navigation';

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
			title: 'Select',
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
	let forceReExecuteCatalogQuery = $state(true);

	const handleCatalogQueryChange = async () => {
		if (!activeTab) return;

		const trimQueryValue = catalogQueryValue.trim();
		if (activeTab === 'categories') queryCategoriesVariables.filter!.search = trimQueryValue;
		else if (activeTab === 'collections') queryCollectionsVariables.filter!.search = trimQueryValue;
		else if (activeTab === 'products') queryProductsVariables.filter!.search = trimQueryValue;
		else queryProductsVariables.filter!.search = trimQueryValue;

		forceReExecuteCatalogQuery = true;
	};

	afterNavigate(async () => {
		catalogQueryValue = '';
		await handleCatalogQueryChange();
	});
</script>

{#snippet commonHeader(name: string)}
	<SectionHeader>
		<span>Eligible {name}</span>
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
	{#if activeTab}
		{@render commonHeader(activeTab)}
	{/if}

	{#if !!activeTab}
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
	{/if}
</div>
