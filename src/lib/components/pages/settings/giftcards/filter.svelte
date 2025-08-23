<script lang="ts">
	import { GIFT_CARD_TAGS_QUERY } from '$lib/api/admin/giftcards';
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import type {
		FilterComponentType,
		FilterItemValue,
		FilterProps,
	} from '$lib/components/common/filter-box';
	import FilterManager from '$lib/components/common/filter-box/filter-manager.svelte';
	import ShopCurrenciesSelect from '$lib/components/common/shop-currencies-select.svelte';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import {
		type GiftCardFilterInput,
		type QueryCustomersArgs,
		type QueryGiftCardsArgs,
		type QueryGiftCardTagsArgs,
		type QueryProductsArgs,
	} from '$lib/gql/graphql';
	import Settings from './settings.svelte';

	type Props = {
		variables: QueryGiftCardsArgs;
		forceReExecuteGraphqlQuery: boolean;
		selectedIds: Record<string, boolean>;
	};

	let {
		variables = $bindable(),
		forceReExecuteGraphqlQuery = $bindable(false),
		selectedIds = $bindable(),
	}: Props = $props();

	const FILTER_OPTIONS: FilterProps<GiftCardFilterInput>[] = [
		{
			label: 'Currency',
			key: 'currency',
			operations: [
				{
					operator: 'eq',
					component: currencyIs,
				},
			],
		},
		{
			label: 'Current balance',
			key: 'currentBalance',
			mustPairWith: 'currency',
			operations: [
				{
					operator: 'lte',
					component: balanceLte,
				},
				{
					operator: 'gte',
					component: balanceGte,
				},
				{
					operator: 'range',
					component: balanceRange,
				},
			],
		},
		{
			label: 'Initial balance',
			key: 'initialBalance',
			mustPairWith: 'currency',
			operations: [
				{
					operator: 'lte',
					component: balanceLte,
				},
				{
					operator: 'gte',
					component: balanceGte,
				},
				{
					operator: 'range',
					component: balanceRange,
				},
			],
		},
		{
			label: 'Products',
			key: 'products',
			operations: [
				{
					operator: 'oneOf',
					component: products,
				},
			],
		},
		{
			label: 'Is active',
			key: 'isActive',
			operations: [
				{
					operator: 'eq',
					component: isActive,
				},
			],
		},
		{
			label: 'Tags',
			key: 'tags',
			operations: [
				{
					operator: 'oneOf',
					component: tags,
				},
			],
		},
		{
			label: 'Used by',
			key: 'usedBy',
			operations: [
				{
					operator: 'oneOf',
					component: usedBy,
				},
			],
		},
		{
			label: 'Is used',
			key: 'used',
			operations: [
				{
					operator: 'eq',
					component: isUsed,
				},
			],
		},
	];
</script>

{#snippet currencyIs({ onValue, initialValue = '' }: FilterComponentType)}
	<ShopCurrenciesSelect
		size="xs"
		placeholder="currency"
		value={initialValue}
		inputDebounceOption={{ onInput: (evt) => onValue((evt.target as HTMLInputElement).value) }}
	/>
{/snippet}

{#snippet balanceLte({ onValue, initialValue = '' }: FilterComponentType)}
	{@render numberSnippet({ onValue, initialValue, placeholder: 'Lte' })}
{/snippet}

{#snippet isUsed({ onValue, initialValue = false }: FilterComponentType)}
	<Checkbox
		size="sm"
		label="Yes"
		checked={initialValue as boolean}
		onchange={(evt) => onValue(evt.currentTarget.checked)}
	/>
{/snippet}

{#snippet balanceGte({ onValue, initialValue = '' }: FilterComponentType)}
	{@render numberSnippet({ onValue, initialValue, placeholder: 'Gte' })}
{/snippet}

{#snippet numberSnippet({ onValue, initialValue, placeholder }: FilterComponentType)}
	<Input
		type="number"
		{placeholder}
		value={initialValue}
		inputDebounceOption={{ onInput: (evt) => onValue((evt.target as HTMLInputElement).value) }}
		size="xs"
	/>
{/snippet}

{#snippet balanceRange({ onValue, initialValue = [] }: FilterComponentType)}
	{@const range = (initialValue || []) as number[]}
	<div class="flex flex-col gap-1">
		{@render numberSnippet({
			onValue: (value) => {
				range[0] = value as number;
				onValue(range);
			},
			initialValue,
			placeholder: 'Lte',
		})}
		{@render numberSnippet({
			onValue: (value) => {
				range[1] = value as number;
				onValue(range);
			},
			initialValue,
			placeholder: 'Gte',
		})}
	</div>
{/snippet}

{#snippet products({ onValue, initialValue = [] }: FilterComponentType)}
	<GraphqlPaginableSelect
		size="xs"
		query={PRODUCT_LIST_QUERY_ADMIN}
		resultKey="products"
		multiple
		optionValueKey="id"
		optionLabelKey="name"
		variables={{ first: 20, filter: { search: '' } } as QueryProductsArgs}
		variableSearchQueryPath="filter.search"
		value={initialValue}
		placeholder="products"
		onchange={(opts) =>
			onValue((opts as SelectOption[])?.map((item) => item.value) as FilterItemValue)}
	/>
{/snippet}

{#snippet tags({ onValue, initialValue = [] }: FilterComponentType)}
	<GraphqlPaginableSelect
		size="xs"
		query={GIFT_CARD_TAGS_QUERY}
		resultKey="giftCardTags"
		multiple
		optionValueKey="id"
		optionLabelKey="name"
		variables={{ first: 20, filter: { search: '' } } as QueryGiftCardTagsArgs}
		variableSearchQueryPath="filter.search"
		value={initialValue}
		placeholder="giftcard tags"
		onchange={(opts) =>
			onValue((opts as SelectOption[])?.map((item) => item.value) as FilterItemValue)}
	/>
{/snippet}

{#snippet usedBy({ onValue, initialValue = [] }: FilterComponentType)}
	<GraphqlPaginableSelect
		size="xs"
		query={CUSTOMER_LIST_QUERY}
		resultKey="customers"
		multiple
		optionValueKey="id"
		optionLabelKey="email"
		variables={{ first: 20, filter: { search: '' } } as QueryCustomersArgs}
		variableSearchQueryPath="filter.search"
		value={initialValue}
		placeholder="customers"
		onchange={(opts) =>
			onValue((opts as SelectOption[])?.map((item) => item.value) as FilterItemValue)}
	/>
{/snippet}

{#snippet isActive({ onValue, initialValue = false }: FilterComponentType)}
	<Checkbox
		size="sm"
		label="Yes"
		checked={initialValue as boolean}
		onchange={(evt) => onValue(evt.currentTarget.checked)}
	/>
{/snippet}

<div class="flex items-center justify-between mb-2">
	<FilterManager
		filterOptions={FILTER_OPTIONS}
		bind:variables
		bind:forceReExecuteGraphqlQuery
		searchKey="search"
	/>

	<Settings {variables} {selectedIds} />
</div>
