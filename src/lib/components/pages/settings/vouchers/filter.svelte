<script lang="ts">
	import { tranFunc } from '$i18n';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box';
	import { FilterManager } from '$lib/components/common/filter-box';
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

	const DISCOUNT_TYPES: {
		value: VoucherDiscountType;
		label: string;
	}[] = [
		{
			value: VoucherDiscountType.Fixed,
			label: $tranFunc('voucher.discountFixed'),
		},
		{
			value: VoucherDiscountType.Percentage,
			label: $tranFunc('voucher.discountPercent'),
		},
		{
			value: VoucherDiscountType.Shipping,
			label: $tranFunc('voucher.discountShip'),
		},
	];

	const DISCOUNT_STATUSES: {
		value: DiscountStatusEnum;
		label: string;
	}[] = [
		{
			value: DiscountStatusEnum.Active,
			label: $tranFunc('staff.active'),
		},
		{
			value: DiscountStatusEnum.Expired,
			label: $tranFunc('voucher.expired'),
		},
		{
			value: DiscountStatusEnum.Scheduled,
			label: $tranFunc('voucher.scheduled'),
		},
	];

	const FilterOptions: FilterProps<VoucherFilterInput> = $derived({
		channel: {
			label: $tranFunc('product.channel'),
			key: 'channel' as keyof VoucherFilterInput,
			operations: {
				eq: channel,
			},
		},
		discountType: {
			label: $tranFunc('voucher.discountType'),
			key: 'discountType',
			operations: {
				eq: discountType,
				oneOf: discountTypeIn,
			},
		},
		started: {
			label: $tranFunc('common.startAt'),
			key: 'started',
			operations: {
				lte: started,
				gte: started,
				range: startedRange,
			},
		},
		status: {
			label: $tranFunc('settings.status'),
			key: 'status',
			operations: {
				eq: status,
				oneOf: statusIn,
			},
		},
		timesUsed: {
			label: $tranFunc('voucher.timeUsed'),
			key: 'timesUsed',
			operations: {
				eq: numberSnippet,
			},
		},
	});
</script>

{#snippet channel({ onValue, initialValue = '' }: FilterComponentType)}
	<ChannelSelect
		size="xs"
		placeholder={$tranFunc('product.channel')}
		value={initialValue}
		inputDebounceOption={{ onInput: (evt) => onValue((evt.target as HTMLInputElement).value) }}
	/>
{/snippet}

{#snippet started({ onValue, initialValue = '' }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		placeholder={$tranFunc('common.time')}
		value={{ date: initialValue as string }}
		onchange={(val) => onValue(val.date!.toString())}
	/>
{/snippet}

{#snippet startedRange({ onValue, initialValue = [] }: FilterComponentType)}
	{@const range = initialValue as string[]}
	<EaseDatePicker
		size="xs"
		placeholder={$tranFunc('common.time')}
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
		placeholder={$tranFunc('voucher.discountType')}
		options={DISCOUNT_TYPES}
		value={initialValue as string}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

{#snippet discountTypeIn({ onValue, initialValue = [] }: FilterComponentType)}
	<Select
		size="xs"
		placeholder={$tranFunc('voucher.discountType')}
		multiple
		options={DISCOUNT_TYPES}
		value={initialValue as string[]}
		onchange={(opts) => onValue((opts as SelectOption[]).map((item) => item.value as string))}
	/>
{/snippet}

{#snippet status({ onValue, initialValue = '' }: FilterComponentType)}
	<Select
		size="xs"
		placeholder={$tranFunc('settings.status')}
		options={DISCOUNT_STATUSES}
		value={initialValue as string}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

{#snippet statusIn({ onValue, initialValue = [] }: FilterComponentType)}
	<Select
		size="xs"
		placeholder={$tranFunc('settings.status')}
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
	filterOptions={FilterOptions}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	searchKey={'filter.search' as keyof QueryVouchersArgs}
/>
