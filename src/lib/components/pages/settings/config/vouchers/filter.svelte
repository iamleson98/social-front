<script lang="ts">
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box';
	import FilterManager from '$lib/components/common/filter-box/filter-manager.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		DiscountStatusEnum,
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
	const DISCOUNT_STATUSES = Object.values(DiscountStatusEnum).map<SelectOption>((value) => ({
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
		{
			label: 'Started',
			key: 'started',
			operations: [
				{
					operator: 'lte',
					component: started,
				},
				{
					operator: 'gte',
					component: started,
				},
				{
					operator: 'range',
					component: startedRange,
				},
			],
		},
		{
			label: 'Status',
			key: 'status',
			operations: [
				{
					operator: 'eq',
					component: status,
				},
				{
					operator: 'oneOf',
					component: statusIn,
				},
			],
		},
		{
			label: 'Times used',
			key: 'timesUsed',
			operations: [
				{
					operator: 'eq',
					component: numberSnippet,
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

{#snippet started({ onValue, initialValue = '' }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		placeholder="Time"
		value={{ date: initialValue as string }}
		onchange={(val) => onValue(val.date!.toString())}
	/>
{/snippet}

{#snippet startedRange({ onValue, initialValue = [] }: FilterComponentType)}
	{@const range = initialValue as string[]}
	<EaseDatePicker
		size="xs"
		placeholder="Time"
		allowSelectRange
		value={{ start: range[0], end: range[1] }}
		onchange={(val) => {
			range[0] = val.start!.toString();
			range[1] = val.end!.toString();
			onValue(range);
		}}
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

{#snippet status({ onValue, initialValue = '' }: FilterComponentType)}
	<Select
		size="xs"
		placeholder="Discount status"
		options={DISCOUNT_STATUSES}
		value={initialValue as string}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

{#snippet statusIn({ onValue, initialValue = [] }: FilterComponentType)}
	<Select
		size="xs"
		placeholder="Discount statuses"
		multiple
		options={DISCOUNT_STATUSES}
		value={initialValue as string[]}
		onchange={(opts) => onValue((opts as SelectOption[]).map((item) => item.value as string))}
	/>
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

<FilterManager
	filterOptions={FILTER_OPTIONS}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	searchKey={'filter.search' as keyof QueryVouchersArgs}
/>
