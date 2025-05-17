<script lang="ts">
	import { PRODUCT_TYPES_QUERY } from '$lib/api/admin/product';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { FilterButton } from '$lib/components/common/filter-box';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box/types';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import type { ProductFilterInput, QueryProductTypesArgs } from '$lib/gql/graphql';

	const FILTER_OPTIONS: FilterProps<ProductFilterInput>[] = [
		{
			label: 'Price',
			key: 'price',
			mustPairWith: 'channel',
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
			label: 'Product type',
			key: 'productTypes',
			operations: [
				{
					operator: 'eq',
					component: productTypeCmp,
				},
			],
		},
	];
</script>

{#snippet productTypeCmp({ onValue, initialValue }: FilterComponentType)}
	<GraphqlPaginableSelect
		query={PRODUCT_TYPES_QUERY}
		variables={{
			first: 100,
			filter: {
				search: '',
			},
		} as QueryProductTypesArgs}
		resultKey="productTypes"
		optionValueKey="id"
		optionLabelKey="name"
		value={initialValue}
		onchange={(value) => onValue(value?.value as string)}
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

<!-- {#snippet categoryIs({ onValue }: FilterComponentType)}
	<Select options={[]} size="xs" />
{/snippet} -->

{#snippet channelComp({ onValue, initialValue = '' }: FilterComponentType)}
	<ChannelSelect size="xs" value={initialValue as string} onchange={onValue} values={undefined} />
{/snippet}

{#snippet yesNo({ onValue, initialValue = false }: FilterComponentType)}
	<Checkbox
		size="sm"
		label="Yes?"
		checked={initialValue as boolean}
		onchange={(evt) => onValue(evt.currentTarget.checked)}
	/>
{/snippet}

<FilterButton filterOptions={FILTER_OPTIONS} />
