<script lang="ts">
	import { T } from '$i18n';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { CommonSnippets } from '$lib/components/common/filter-box/snippets.svelte';
	import type { GraphqlPaginableTableInterface } from '$lib/components/ui/Table';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		DiscountStatusEnum,
		VoucherDiscountType,
		type QueryVouchersArgs,
		type VoucherFilterInput,
	} from '$lib/gql/graphql';

	type Props = {
		variables: QueryVouchersArgs;
		tableRef?: GraphqlPaginableTableInterface;
	};

	let { variables = $bindable(), tableRef }: Props = $props();

	const DISCOUNT_TYPES: {
		value: VoucherDiscountType;
		label: string;
	}[] = [
		{
			value: VoucherDiscountType.Fixed,
			label: $T('voucher.discountFixed'),
		},
		{
			value: VoucherDiscountType.Percentage,
			label: $T('voucher.discountPercent'),
		},
		{
			value: VoucherDiscountType.Shipping,
			label: $T('voucher.discountShip'),
		},
	];

	const DISCOUNT_STATUSES: {
		value: DiscountStatusEnum;
		label: string;
	}[] = [
		{
			value: DiscountStatusEnum.Active,
			label: $T('staff.active'),
		},
		{
			value: DiscountStatusEnum.Expired,
			label: $T('voucher.expired'),
		},
		{
			value: DiscountStatusEnum.Scheduled,
			label: $T('voucher.scheduled'),
		},
	];

	const FilterOptions: FilterProps<VoucherFilterInput> = $derived({
		channel: {
			label: $T('product.channel'),
			key: 'channel' as keyof VoucherFilterInput,
			operations: {
				eq: CommonSnippets.singleChannelSlug,
			},
		},
		discountType: {
			label: $T('voucher.discountType'),
			key: 'discountType',
			operations: {
				eq: discountType,
				oneOf: discountTypeIn,
			},
		},
		started: {
			label: $T('common.startAt'),
			key: 'started',
			operations: {
				lte: CommonSnippets.singleDatetime,
				gte: CommonSnippets.singleDatetime,
				range: CommonSnippets.datetimeRange,
			},
		},
		status: {
			label: $T('settings.status'),
			key: 'status',
			operations: {
				eq: status,
				oneOf: statusIn,
			},
		},
		timesUsed: {
			label: $T('voucher.timeUsed'),
			key: 'timesUsed',
			operations: {
				eq: CommonSnippets.singleNumber,
				range: CommonSnippets.numberRange,
			},
		},
	});
</script>

{#snippet discountType({ onValue, initialValue = '' }: FilterComponentType)}
	<Select
		size="xs"
		placeholder={$T('voucher.discountType')}
		options={DISCOUNT_TYPES}
		value={initialValue as string}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

{#snippet discountTypeIn({ onValue, initialValue = [] }: FilterComponentType)}
	<Select
		size="xs"
		placeholder={$T('voucher.discountType')}
		multiple
		options={DISCOUNT_TYPES}
		value={initialValue as string[]}
		onchange={(opts) => onValue((opts as SelectOption[]).map((item) => item.value as string))}
	/>
{/snippet}

{#snippet status({ onValue, initialValue = '' }: FilterComponentType)}
	<Select
		size="xs"
		placeholder={$T('settings.status')}
		options={DISCOUNT_STATUSES}
		value={initialValue as string}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

{#snippet statusIn({ onValue, initialValue = [] }: FilterComponentType)}
	<Select
		size="xs"
		placeholder={$T('settings.status')}
		multiple
		options={DISCOUNT_STATUSES}
		value={initialValue as string[]}
		onchange={(opts) => onValue((opts as SelectOption[]).map((item) => item.value as string))}
	/>
{/snippet}

<FilterManager
	filterOptions={FilterOptions}
	bind:variables
	onRefetchData={() => tableRef?.triggerFetchData()}
	searchKey={'filter.search' as keyof QueryVouchersArgs}
	variablePatchingCallbackAfterReload={(filterVariables, params) => {
		if (!filterVariables.filter) filterVariables.filter = {};
		const { discountType, started, status, timesUsed } = params;

		if (params['channel' as keyof VoucherFilterInput])
			filterVariables.channel = params['channel' as keyof VoucherFilterInput].value as string;
		if (discountType) {
			if (discountType.operator === 'oneOf' && Array.isArray(discountType.value))
				filterVariables.filter.discountType = discountType.value as VoucherDiscountType[];
			else if (discountType.operator === 'eq')
				filterVariables.filter.discountType = [discountType.value as VoucherDiscountType];
		}
		if (started) {
			if (started.operator === 'range' && Array.isArray(started.value))
				filterVariables.filter.started = {
					gte: started.value[0],
					lte: started.value[1],
				};
			else if (['gte', 'lte'].includes(started.operator))
				filterVariables.filter.started = { [started.operator]: started.value };
		}
		if (status) {
			if (status.operator === 'oneOf' && Array.isArray(status.value))
				filterVariables.filter.status = status.value as DiscountStatusEnum[];
			else if (status.operator === 'eq')
				filterVariables.filter.status = [status.value as DiscountStatusEnum];
		}
		if (timesUsed) {
			if (timesUsed.operator === 'range' && Array.isArray(timesUsed.value))
				filterVariables.filter.timesUsed = {
					gte: timesUsed.value[0] as number,
					lte: timesUsed.value[1] as number,
				};
			else if (timesUsed.operator === 'eq')
				filterVariables.filter.timesUsed = {
					gte: timesUsed.value as number,
					lte: timesUsed.value as number,
				};
		}

		return filterVariables;
	}}
/>
