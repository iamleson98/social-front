<script lang="ts">
	import { CATEGORIES_LIST_QUERY_STORE } from '$lib/api';
	import { PRODUCT_TYPES_QUERY } from '$lib/api/admin/product';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import FilterManager from '$lib/components/common/filter-box/filter-manager.svelte';
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

	const FILTER_OPTIONS: FilterProps<ProductFilterInput>[] = [
		{
			label: 'Price',
			key: 'price',
			mustPairWith: 'channel', //
			operations: [
				{
					operator: 'eq',
					component: priceCmp,
				},
				{
					operator: 'lte',
					component: priceCmp,
				},
				{
					operator: 'gte',
					component: priceCmp,
				},
				{
					operator: 'range',
					component: priceBetween,
				},
			],
		},
		{
			label: 'Category',
			key: 'categories',
			operations: [
				{
					operator: 'eq',
					component: categoryIs,
				},
				{
					operator: 'oneOf',
					component: categoryOneOf,
				},
			],
		},
		{
			label: 'Collection',
			key: 'collections',
			operations: [
				{
					operator: 'oneOf',
					component: collectionOneOf,
				},
			],
		},
		{
			label: 'Channel',
			key: 'channel',
			operations: [
				{
					operator: 'eq',
					component: channelComp,
				},
			],
		},
		{
			label: 'Product type',
			key: 'productTypes',
			operations: [
				{
					operator: 'eq',
					component: productTypeIs,
				},
				{
					operator: 'oneOf',
					component: productTypeOneOf,
				},
			],
		},
		{
			label: 'Is available',
			key: 'isAvailable',
			mustPairWith: 'channel',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: 'Is published',
			key: 'isPublished',
			mustPairWith: 'channel',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: 'Visible in listing',
			key: 'isVisibleInListing',
			mustPairWith: 'channel',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: 'Has category',
			key: 'hasCategory',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: 'Is giftcard',
			key: 'giftCard',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
	];
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
		value={initialValue as string}
		onchange={(opt) => onValue((opt as Channel)?.id as FilterItemValue)}
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
	filterOptions={FILTER_OPTIONS}
	bind:forceReExecuteGraphqlQuery
	bind:variables
	searchKey="search"
/>
