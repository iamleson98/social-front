<script lang="ts">
	import { T } from '$i18n';
	import { CATEGORIES_LIST_QUERY_STORE } from '$lib/api';
	import { PRODUCT_TYPES_QUERY } from '$lib/api/admin/product';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { CommonSnippets } from '$lib/components/common/filter-box/snippets.svelte';
	import type {
		FilterComponentType,
		FilterItemValue,
		FilterProps,
	} from '$lib/components/common/filter-box/types';
	import type { GraphqlPaginableTableInterface } from '$lib/components/ui/Table';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import type {
		ProductFilterInput,
		QueryCategoriesArgs,
		QueryCollectionsArgs,
		QueryProductsArgs,
		QueryProductTypesArgs,
	} from '$lib/gql/graphql';

	type Props = {
		variables: QueryProductsArgs;
		tableRef?: GraphqlPaginableTableInterface;
	};

	let { variables = $bindable(), tableRef }: Props = $props();

	const FilterOptions: FilterProps<ProductFilterInput> = {
		price: {
			label: $T('product.price'),
			mustPairWith: 'channel', //
			operations: {
				eq: CommonSnippets.singleNumber,
				lte: CommonSnippets.singleNumber,
				gte: CommonSnippets.singleNumber,
				range: CommonSnippets.numberRange,
			},
		},
		categories: {
			label: $T('product.category'),
			operations: {
				eq: categoryIs,
				oneOf: categoryOneOf,
			},
		},
		collections: {
			label: $T('product.collection'),
			operations: {
				oneOf: collectionOneOf,
			},
		},
		channel: {
			label: $T('product.channel'),
			operations: {
				eq: CommonSnippets.singleChannelSlug,
			},
		},
		productTypes: {
			label: $T('product.prdType'),
			operations: {
				eq: productTypeIs,
				oneOf: productTypeOneOf,
			},
		},
		isAvailable: {
			label: $T('product.availForPurchase'),
			mustPairWith: 'channel',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		isPublished: {
			label: $T('product.published'),
			mustPairWith: 'channel',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		isVisibleInListing: {
			label: $T('product.visibleInListing'),
			mustPairWith: 'channel',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		hasCategory: {
			label: $T('product.hasCategory'),
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		giftCard: {
			label: $T('product.isGiftcard'),
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
	};
</script>

{#snippet categoryIs({ onValue, initialValue = '' }: FilterComponentType)}
	<GraphqlPaginableSelect
		placeholder={$T('product.category')}
		query={CATEGORIES_LIST_QUERY_STORE}
		resultKey="categories"
		optionValueKey="id"
		optionLabelKey="name"
		requestPolicy="cache-and-network"
		variables={{ first: 20, filter: { search: '' } } as QueryCategoriesArgs}
		variableSearchQueryPath="filter.search"
		value={initialValue}
		onchange={(opt) => onValue((opt as SelectOption)?.value)}
		size="xs"
	/>
{/snippet}

{#snippet categoryOneOf({ onValue, initialValue = [] }: FilterComponentType)}
	<GraphqlPaginableSelect
		placeholder={$T('product.category')}
		query={CATEGORIES_LIST_QUERY_STORE}
		resultKey="categories"
		maxDisplay={6}
		optionValueKey="id"
		optionLabelKey="name"
		requestPolicy="cache-and-network"
		variables={{ first: 20, filter: { search: '' } } as QueryCategoriesArgs}
		variableSearchQueryPath="filter.search"
		value={initialValue}
		onchange={(opt) =>
			onValue((opt as SelectOption[])?.map((item) => item.value) as FilterItemValue)}
		multiple
		size="xs"
	/>
{/snippet}

{#snippet productTypeIs({ onValue, initialValue = '' }: FilterComponentType)}
	<GraphqlPaginableSelect
		placeholder={$T('product.prdType')}
		query={PRODUCT_TYPES_QUERY}
		resultKey="productTypes"
		optionValueKey="id"
		optionLabelKey="name"
		requestPolicy="cache-and-network"
		variables={{ first: 20, filter: { search: '' } } as QueryProductTypesArgs}
		variableSearchQueryPath="filter.search"
		value={initialValue}
		onchange={(opt) => onValue((opt as SelectOption).value)}
		size="xs"
	/>
{/snippet}

{#snippet productTypeOneOf({ onValue, initialValue = [] }: FilterComponentType)}
	<GraphqlPaginableSelect
		placeholder={$T('product.prdType')}
		query={PRODUCT_TYPES_QUERY}
		resultKey="productTypes"
		maxDisplay={6}
		optionValueKey="id"
		optionLabelKey="name"
		requestPolicy="cache-and-network"
		variables={{ first: 20, filter: { search: '' } } as QueryProductTypesArgs}
		variableSearchQueryPath="filter.search"
		value={initialValue}
		onchange={(opt) =>
			onValue((opt as SelectOption[]).map((item) => item.value) as FilterItemValue)}
		multiple
		size="xs"
	/>
{/snippet}

{#snippet collectionOneOf({ onValue, initialValue = [] }: FilterComponentType)}
	<GraphqlPaginableSelect
		placeholder={$T('product.collection')}
		query={COLLECTIONS_QUERY}
		resultKey="collections"
		optionValueKey="id"
		optionLabelKey="name"
		requestPolicy="cache-and-network"
		variables={{ first: 20, filter: { search: '' } } as QueryCollectionsArgs}
		variableSearchQueryPath="filter.search"
		value={initialValue}
		onchange={(opt) =>
			onValue((opt as SelectOption[]).map((item) => item.value) as FilterItemValue)}
		multiple
		size="xs"
	/>
{/snippet}

<FilterManager
	filterOptions={FilterOptions}
	onRefetchData={() => tableRef?.triggerFetchData()}
	bind:variables
	searchKey="search"
	variablePatchingCallbackAfterReload={(vars, params) => {
		const {
			giftCard,
			hasCategory,
			isVisibleInListing,
			isPublished,
			isAvailable,
			productTypes,
			channel,
			collections,
			categories,
			price,
		} = params;
		if (!vars.filter) vars.filter = {}; // create if not have

		if (giftCard) vars.filter.giftCard = giftCard.value as boolean;
		if (hasCategory) vars.filter.hasCategory = hasCategory.value as boolean;
		if (isVisibleInListing) vars.filter.isVisibleInListing = isVisibleInListing.value as boolean;
		if (isPublished) vars.filter.isPublished = isPublished.value as boolean;
		if (isAvailable) vars.filter.isAvailable = isAvailable.value as boolean;

		if (productTypes) {
			if (productTypes.operator === 'eq') vars.filter.productTypes = [productTypes.value as string];
			else if (productTypes.operator === 'oneOf')
				vars.filter.productTypes = productTypes.value as string[];
		}
		if (channel) vars.channel = channel.value as string;
		if (collections) vars.filter.collections = collections.value as string[];
		if (categories) {
			if (categories.operator === 'eq') vars.filter.categories = [categories.value as string];
			else if (categories.operator === 'oneOf')
				vars.filter.categories = categories.value as string[];
		}
		if (price) {
			if (price.operator === 'eq')
				vars.filter.price = {
					gte: price.value as number,
					lte: price.value as number,
				};
			else if (price.operator === 'gte') vars.filter.price = { gte: price.value as number };
			else if (price.operator === 'lte') vars.filter.price = { lte: price.value as number };
			else if (price.operator === 'range' && Array.isArray(price.value))
				vars.filter.price = {
					gte: price.value[0] as number,
					lte: price.value[1] as number,
				};
		}

		return vars;
	}}
/>
