<script lang="ts">
	import { tranFunc } from '$i18n';
	import { GIFT_CARD_TAGS_QUERY } from '$lib/api/admin/giftcards';
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import type {
		FilterComponentType,
		FilterItemValue,
		FilterProps,
	} from '$lib/components/common/filter-box';
	import { FilterManager } from '$lib/components/common/filter-box';
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

	type Props = {
		variables: QueryGiftCardsArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable(false) }: Props = $props();

	const FilterOptions: FilterProps<GiftCardFilterInput> = $derived({
		currency: {
			label: $tranFunc('common.currency'),
			operations: {
				eq: currencyIs,
			},
		},
		currentBalance: {
			label: $tranFunc('giftcard.currentBalance'),
			mustPairWith: 'currency',
			operations: {
				lte: balanceLte,
				gte: balanceGte,
				range: balanceRange,
			},
		},
		initialBalance: {
			label: $tranFunc('giftcard.initialBalance'),
			mustPairWith: 'currency',
			operations: {
				lte: balanceLte,
				gte: balanceGte,
				range: balanceRange,
			},
		},
		products: {
			label: $tranFunc('common.products'),
			operations: {
				oneOf: products,
			},
		},
		isActive: {
			label: $tranFunc('staff.active'),
			operations: {
				eq: isActive,
			},
		},
		tags: {
			label: $tranFunc('giftcard.form.tags'),
			operations: {
				oneOf: tags,
			},
		},
		usedBy: {
			label: $tranFunc('giftcard.filter.usedBy'),
			operations: {
				oneOf: usedBy,
			},
		},
		used: {
			label: $tranFunc('giftcard.usedAmount'),
			operations: {
				eq: isUsed,
			},
		},
	});
</script>

{#snippet currencyIs({ onValue, initialValue = '' }: FilterComponentType)}
	<ShopCurrenciesSelect
		size="xs"
		placeholder={$tranFunc('common.currency')}
		value={initialValue}
		inputDebounceOption={{ onInput: (evt) => onValue((evt.target as HTMLInputElement).value) }}
	/>
{/snippet}

{#snippet balanceLte({ onValue, initialValue = '' }: FilterComponentType)}
	{@render numberSnippet({ onValue, initialValue, placeholder: $tranFunc('common.lte') })}
{/snippet}

{#snippet isUsed({ onValue, initialValue = false }: FilterComponentType)}
	<Checkbox
		size="sm"
		label={$tranFunc('common.yes')}
		checked={initialValue as boolean}
		onchange={(evt) => onValue(evt.currentTarget.checked)}
	/>
{/snippet}

{#snippet balanceGte({ onValue, initialValue = '' }: FilterComponentType)}
	{@render numberSnippet({ onValue, initialValue, placeholder: $tranFunc('common.gte') })}
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
			placeholder: $tranFunc('common.lte'),
		})}
		{@render numberSnippet({
			onValue: (value) => {
				range[1] = value as number;
				onValue(range);
			},
			initialValue,
			placeholder: $tranFunc('common.gte'),
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
		placeholder={$tranFunc('common.products')}
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
		placeholder={$tranFunc('giftcard.form.tags')}
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
		placeholder={$tranFunc('common.user')}
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

<FilterManager
	filterOptions={FilterOptions}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	searchKey="search"
	variablePatchingCallbackAfterReload={(newVariables, params) => {
		if (!newVariables.filter) newVariables.filter = {};

		const { currency, used, usedBy, tags, isActive, products, initialBalance, currentBalance } =
			params;

		if (currency) newVariables.filter.currency = currency.value as string;
		if (used) newVariables.filter.used = used.value as boolean;
		if (usedBy && Array.isArray(usedBy.value))
			newVariables.filter.usedBy = usedBy.value as string[];
		if (tags && Array.isArray(tags.value)) newVariables.filter.tags = tags.value as string[];
		if (isActive) newVariables.filter.isActive = isActive.value as boolean;
		if (products && Array.isArray(products.value))
			newVariables.filter.products = products.value as string[];
		if (initialBalance) {
			if (initialBalance.operator === 'range' && Array.isArray(initialBalance.value))
				newVariables.filter.initialBalance = {
					gte: initialBalance.value[0] as number,
					lte: initialBalance.value[1] as number,
				};
			else if (['gte', 'lte'].includes(initialBalance.operator))
				newVariables.filter.initialBalance = { [initialBalance.operator]: initialBalance.value };
		}
		if (currentBalance) {
			if (currentBalance.operator === 'range' && Array.isArray(currentBalance.value))
				newVariables.filter.currentBalance = {
					gte: currentBalance.value[0] as number,
					lte: currentBalance.value[1] as number,
				};
			else if (['gte', 'lte'].includes(currentBalance.operator))
				newVariables.filter.currentBalance = { [currentBalance.operator]: currentBalance.value };
		}

		return newVariables;
	}}
/>
