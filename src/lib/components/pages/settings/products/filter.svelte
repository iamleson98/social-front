<script lang="ts">
	import { tranFunc } from '$i18n';
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
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import type {
		ProductFilterInput,
		QueryCategoriesArgs,
		QueryCollectionsArgs,
		QueryProductsArgs,
		QueryProductTypesArgs,
	} from '$lib/gql/graphql';

	type Props = {
		forceReExecuteGraphqlQuery: boolean;
		variables: QueryProductsArgs;
	};

	let { forceReExecuteGraphqlQuery = $bindable(), variables = $bindable() }: Props = $props();

	const FilterOptions: FilterProps<ProductFilterInput> = {
		price: {
			label: $tranFunc('product.price'),
			mustPairWith: 'channel', //
			operations: {
				eq: CommonSnippets.singleNumber,
				lte: CommonSnippets.singleNumber,
				gte: CommonSnippets.singleNumber,
				range: CommonSnippets.numberRange,
			},
		},
		categories: {
			label: $tranFunc('product.category'),
			operations: {
				eq: categoryIs,
				oneOf: categoryOneOf,
			},
		},
		collections: {
			label: $tranFunc('product.collection'),
			operations: {
				oneOf: collectionOneOf,
			},
		},
		channel: {
			label: $tranFunc('product.channel'),
			operations: {
				eq: CommonSnippets.singleChannelSlug,
			},
		},
		productTypes: {
			label: $tranFunc('product.prdType'),
			operations: {
				eq: productTypeIs,
				oneOf: productTypeOneOf,
			},
		},
		isAvailable: {
			label: $tranFunc('product.availForPurchase'),
			mustPairWith: 'channel',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		isPublished: {
			label: $tranFunc('product.published'),
			mustPairWith: 'channel',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		isVisibleInListing: {
			label: $tranFunc('product.visibleInListing'),
			mustPairWith: 'channel',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		hasCategory: {
			label: $tranFunc('product.hasCategory'),
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		giftCard: {
			label: $tranFunc('product.isGiftcard'),
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
	};
</script>

{#snippet categoryIs({ onValue, initialValue = '' }: FilterComponentType)}
	<GraphqlPaginableSelect
		placeholder={$tranFunc('product.category')}
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
		placeholder={$tranFunc('product.category')}
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
		placeholder={$tranFunc('product.prdType')}
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
		placeholder={$tranFunc('product.prdType')}
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
		placeholder={$tranFunc('product.collection')}
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
	bind:forceReExecuteGraphqlQuery
	bind:variables
	searchKey="search"
	variablePatchingCallbackAfterReload={(variables, params) => {
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
		if (!variables.filter) variables.filter = {}; // create if not have

		if (giftCard) variables.filter.giftCard = giftCard.value as boolean;
		if (hasCategory) variables.filter.hasCategory = hasCategory.value as boolean;
		if (isVisibleInListing)
			variables.filter.isVisibleInListing = isVisibleInListing.value as boolean;
		if (isPublished) variables.filter.isPublished = isPublished.value as boolean;
		if (isAvailable) variables.filter.isAvailable = isAvailable.value as boolean;

		if (productTypes) {
			if (productTypes.operator === 'eq')
				variables.filter.productTypes = [productTypes.value as string];
			else if (productTypes.operator === 'oneOf')
				variables.filter.productTypes = productTypes.value as string[];
		}
		if (channel) variables.channel = channel.value as string;
		if (collections) variables.filter.collections = collections.value as string[];
		if (categories) {
			if (categories.operator === 'eq') variables.filter.categories = [categories.value as string];
			else if (categories.operator === 'oneOf')
				variables.filter.categories = categories.value as string[];
		}
		if (price) {
			if (price.operator === 'eq')
				variables.filter.price = {
					gte: price.value as number,
					lte: price.value as number,
				};
			else if (price.operator === 'gte') variables.filter.price = { gte: price.value as number };
			else if (price.operator === 'lte') variables.filter.price = { lte: price.value as number };
			else if (price.operator === 'range' && Array.isArray(price.value))
				variables.filter.price = {
					gte: price.value[0] as number,
					lte: price.value[1] as number,
				};
		}

		return variables;
	}}
/>
