<script lang="ts">
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box';
	import FilterManager from '$lib/components/common/filter-box/filter-manager.svelte';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		VoucherDiscountType,
		type QueryVouchersArgs,
		type VoucherFilterInput,
	} from '$lib/gql/graphql';

	type Props = {
		variables: QueryVouchersArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable(false) }: Props = $props();

	const DISCOUNT_TYPES = Object.values(VoucherDiscountType).map<SelectOption>((value) => ({
		value,
		label: value.toLowerCase(),
	}));

	const FILTER_OPTIONS: FilterProps<VoucherFilterInput>[] = [
		{
			label: 'Channel',
			key: 'channel' as keyof VoucherFilterInput,
			operations: [
				{
					operator: 'eq',
					component: channel,
				},
			],
		},
		{
			label: 'Discount type',
			key: 'discountType',
			operations: [
				{
					operator: 'eq',
					component: discountType,
				},
				{
					operator: 'oneOf',
					component: discountTypeIn,
				},
			],
		},
	];
</script>

{#snippet channel({ onValue, initialValue = '' }: FilterComponentType)}
	<ChannelSelect
		size="xs"
		placeholder="channel"
		value={initialValue}
		inputDebounceOption={{ onInput: (evt) => onValue((evt.target as HTMLInputElement).value) }}
	/>
{/snippet}

{#snippet discountType({ onValue, initialValue = '' }: FilterComponentType)}
	<Select
		size="xs"
		placeholder="discount type"
		options={DISCOUNT_TYPES}
		value={initialValue as string}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

{#snippet discountTypeIn({ onValue, initialValue = [] }: FilterComponentType)}
	<Select
		size="xs"
		placeholder="discount types"
		multiple
		options={DISCOUNT_TYPES}
		value={initialValue as string[]}
		onchange={(opts) => onValue((opts as SelectOption[]).map((item) => item.value as string))}
	/>
{/snippet}

<FilterManager
	filterOptions={FILTER_OPTIONS}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	searchKey={'filter.search' as keyof QueryVouchersArgs}
/>
