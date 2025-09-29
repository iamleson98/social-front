<script lang="ts">
	import { CATEGORIES_LIST_QUERY_STORE } from '$lib/api';
	import { PRODUCT_TYPES_QUERY } from '$lib/api/admin/product';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { FilterManager } from '$lib/components/common/filter-box';
	import type {
		FilterComponentType,
		FilterItemValue,
		FilterProps,
	} from '$lib/components/common/filter-box/types';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import type {
		Channel,
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
			label: 'Price',
			mustPairWith: 'channel', //
			operations: {
				eq: priceCmp,
				lte: priceCmp,
				gte: priceCmp,
				range: priceBetween,
			},
		},
		categories: {
			label: 'Category',
			operations: {
				eq: categoryIs,
				oneOf: categoryOneOf,
			},
		},
		collections: {
			label: 'Collection',
			operations: {
				oneOf: collectionOneOf,
			},
		},
		channel: {
			label: 'Channel',
			operations: {
				eq: channelComp,
			},
		},
		productTypes: {
			label: 'Product type',
			operations: {
				eq: productTypeIs,
				oneOf: productTypeOneOf,
			},
		},
		isAvailable: {
			label: 'Is available',
			mustPairWith: 'channel',
			operations: {
				eq: yesNo,
			},
		},
		isPublished: {
			label: 'Is published',
			mustPairWith: 'channel',
			operations: {
				eq: yesNo,
			},
		},
		isVisibleInListing: {
			label: 'Visible in listing',
			mustPairWith: 'channel',
			operations: {
				eq: yesNo,
			},
		},
		hasCategory: {
			label: 'Has category',
			operations: {
				eq: yesNo,
			},
		},
		giftCard: {
			label: 'Is giftcard',
			operations: {
				eq: yesNo,
			},
		},
	};
</script>

{#snippet categoryIs({ onValue, initialValue = '' }: FilterComponentType)}
	<GraphqlPaginableSelect
		placeholder="Enter category"
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
		placeholder="Enter category"
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
		placeholder="Enter product type"
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
		placeholder="Enter product type"
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
		placeholder="Enter collection"
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

{#snippet priceCmp({ onValue, initialValue }: FilterComponentType)}
	<Input
		size="xs"
		placeholder="Enter price"
		type="number"
		min="0"
		value={initialValue}
		inputDebounceOption={{
			onInput: (evt) => onValue(((evt as Event).target as HTMLInputElement).value),
		}}
	/>
{/snippet}

{#snippet priceBetween({ onValue, initialValue }: FilterComponentType)}
	{@const bounds = (initialValue || ['', '']) as string[]}
	<div class="flex gap-1 flex-col">
		{@render priceCmp({
			onValue: (value) => {
				bounds[0] = value as string;
				onValue(bounds);
			},
			initialValue: bounds[0],
			placeholder: '>=',
		})}
		{@render priceCmp({
			onValue: (value) => {
				bounds[1] = value as string;
				onValue(bounds);
			},
			initialValue: bounds[1],
			placeholder: '<=',
		})}
	</div>
{/snippet}

{#snippet channelComp({ onValue, initialValue = '' }: FilterComponentType)}
	<ChannelSelect
		size="xs"
		valueType="slug"
		value={initialValue as string}
		onchange={(opt) => onValue((opt as Channel)?.slug as FilterItemValue)}
	/>
{/snippet}

{#snippet yesNo({ onValue, initialValue = false }: FilterComponentType)}
	<Checkbox
		size="sm"
		label="Yes?"
		checked={initialValue as boolean}
		onchange={(evt) => onValue(evt.currentTarget.checked)}
	/>
{/snippet}

<FilterManager
	filterOptions={FilterOptions}
	bind:forceReExecuteGraphqlQuery
	bind:variables
	searchKey="search"
	extraVariablesFiltersPatching={(variables, params) => {
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
