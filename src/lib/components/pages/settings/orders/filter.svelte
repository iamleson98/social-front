<script lang="ts">
	import { SHOP_ORDERS_QUERY } from '$lib/api/admin/orders';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { FilterManager } from '$lib/components/common/filter-box';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box/types';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import {
		OrderAuthorizeStatusEnum,
		OrderChargeStatusEnum,
		OrderStatus,
		OrderStatusFilter,
		PaymentChargeStatusEnum,
		type OrderFilterInput,
		type QueryOrdersArgs,
	} from '$lib/gql/graphql';
	import { BASIC_DATE_FORMAT } from '$lib/utils/consts';
	import { orderStatusBadgeClass, paymentStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	type Props = {
		variables: QueryOrdersArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable(false) }: Props = $props();

	const AUTHORIZE_OPTIONS = Object.values(OrderAuthorizeStatusEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLowerCase(),
	}));

	const CHARGE_OPTIONS = Object.values(OrderChargeStatusEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLowerCase(),
	}));

	const FilterOptions: FilterProps<OrderFilterInput> = {
		ids: {
			label: 'IDs',
			operations: {
				oneOf: orderIds,
			},
		},
		channels: {
			label: 'Channels',
			operations: {
				oneOf: channels,
			},
		},
		created: {
			label: 'Creation date',
			operations: {
				lte: creationDate,
				gte: creationDate,
				range: creationDateRange,
			},
		},
		updatedAt: {
			label: 'Updated at',
			operations: {
				lte: updatedAt,
				gte: updatedAt,
				range: updatedAtRange,
			},
		},
		paymentStatus: {
			label: 'Payment status',
			operations: {
				eq: paymentStatus,
				oneOf: paymentStatuses,
			},
		},
		status: {
			label: 'Fulfillment status',
			operations: {
				eq: fulfillmentStatus,
				oneOf: fulfillmentStatuses,
			},
		},
		isClickAndCollect: {
			label: 'Click and collect',
			operations: {
				eq: yesNo,
			},
		},
		isPreorder: {
			label: 'Is preorder',
			operations: {
				eq: yesNo,
			},
		},
		giftCardUsed: {
			label: 'Gift card used',
			operations: {
				eq: yesNo,
			},
		},
		giftCardBought: {
			label: 'Gift card bought',
			operations: {
				eq: yesNo,
			},
		},
		authorizeStatus: {
			label: 'Authorize status',
			operations: {
				eq: authorize,
				oneOf: authorizeIn,
			},
		},
		chargeStatus: {
			label: 'Charge status',
			operations: {
				eq: chargeEq,
				oneOf: chargeIn,
			},
		},
		metadata: {
			label: 'Metadata',
			operations: {
				eq: metadataComponent,
			},
		},
		customer: {
			label: 'Customer',
			operations: {
				eq: customerSelect,
			},
		},
	};

	const paymentStatusOptions = Object.values(PaymentChargeStatusEnum).map<SelectOption>(
		(status) => {
			const { text } = paymentStatusBadgeClass(status);
			return {
				value: status,
				label: text as string,
			};
		},
	);

	const fulfillmentStatuOptions = Object.values(OrderStatusFilter).map<SelectOption>((status) => {
		const { text } = orderStatusBadgeClass(status as never);
		return {
			value: status,
			label: text as string,
		};
	});
</script>

{#snippet orderIds({ onValue, initialValue = [] }: FilterComponentType)}
	<GraphqlPaginableSelect
		placeholder="Select orders"
		query={SHOP_ORDERS_QUERY}
		resultKey="orders"
		size="xs"
		optionLabelKey="number"
		optionValueKey="id"
		variables={{ first: 20, filter: { search: '' } } as QueryOrdersArgs}
		variableSearchQueryPath="filter.search"
		value={initialValue}
		multiple
		onchange={(opts) => onValue((opts as SelectOption[]).map((opt) => opt.value) as string[])}
	/>
{/snippet}

{#snippet authorize({ onValue, initialValue }: FilterComponentType)}
	<Select
		placeholder="Authorize status"
		options={AUTHORIZE_OPTIONS}
		size="xs"
		value={initialValue as string}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

{#snippet authorizeIn({ onValue, initialValue }: FilterComponentType)}
	<Select
		placeholder="Authorize statuses"
		options={AUTHORIZE_OPTIONS}
		size="xs"
		value={initialValue as string}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

{#snippet customerSelect({ onValue, initialValue = '' }: FilterComponentType)}
	<GraphqlPaginableSelect
		query={CUSTOMER_LIST_QUERY}
		variables={{ first: 10 }}
		resultKey="customers"
		variableSearchQueryPath="filter.search"
		placeholder="Select customer"
		optionValueKey="email"
		optionLabelKey="email"
		size="xs"
		value={initialValue}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

{#snippet chargeEq({ onValue, initialValue }: FilterComponentType)}
	<Select
		placeholder="Charge status"
		options={CHARGE_OPTIONS}
		size="xs"
		value={initialValue as string}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

{#snippet chargeIn({ onValue, initialValue = [] }: FilterComponentType)}
	<Select
		placeholder="Charge status"
		options={CHARGE_OPTIONS}
		size="xs"
		value={initialValue as string[]}
		multiple
		onchange={(opts) => onValue((opts as SelectOption[]).map((item) => item.value as string))}
	/>
{/snippet}

{#snippet creationDate({ onValue, initialValue = '' }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		placeholder="Date"
		value={{ date: initialValue as string }}
		onchange={(vl) => onValue(dayjs(vl.date).format(BASIC_DATE_FORMAT))}
	/>
{/snippet}

{#snippet creationDateRange({ onValue, initialValue = ['', ''] }: FilterComponentType)}
	{@const range = initialValue as string[]}
	<EaseDatePicker
		size="xs"
		placeholder="Date range"
		value={{ start: range[0], end: range[1] }}
		onchange={(vl) => {
			range[0] = dayjs(vl.start).format(BASIC_DATE_FORMAT);
			range[1] = dayjs(vl.end).format(BASIC_DATE_FORMAT);
			onValue(range);
		}}
		allowSelectRange
	/>
{/snippet}

{#snippet updatedAt({ onValue, initialValue = '' }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		placeholder="Date"
		value={{ date: initialValue as string }}
		onchange={(vl) => onValue(dayjs(vl.date).format(BASIC_DATE_FORMAT))}
	/>
{/snippet}

{#snippet updatedAtRange({ onValue, initialValue = ['', ''] }: FilterComponentType)}
	{@const range = initialValue as string[]}
	<EaseDatePicker
		size="xs"
		placeholder="Date range"
		value={{ start: range[0], end: range[1] }}
		onchange={(vl) => {
			range[0] = dayjs(vl.start).format(BASIC_DATE_FORMAT);
			range[1] = dayjs(vl.end).format(BASIC_DATE_FORMAT);
			onValue(range);
		}}
		allowSelectRange
	/>
{/snippet}

{#snippet channels({ onValue, initialValue = [] }: FilterComponentType)}
	<ChannelSelect
		size="xs"
		multiple
		onchange={(opt) => {
			if (opt && Array.isArray(opt)) {
				onValue(opt.map((opt) => opt.id as string));
			}
		}}
		value={initialValue as string[]}
		valueType="id"
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

{#snippet paymentStatus({ onValue, initialValue = '' }: FilterComponentType)}
	<Select
		options={paymentStatusOptions}
		placeholder="Charge status"
		value={initialValue as string}
		onchange={(opt) => opt && onValue((opt as SelectOption).value)}
		size="xs"
	/>
{/snippet}

{#snippet paymentStatuses({ onValue, initialValue = [] }: FilterComponentType)}
	<Select
		options={paymentStatusOptions}
		placeholder="Payment statuses"
		multiple
		value={initialValue as PaymentChargeStatusEnum[]}
		onchange={(opts) => {
			if (opts && Array.isArray(opts)) {
				onValue(opts.map((opt) => opt.value as string));
			}
		}}
		size="xs"
	/>
{/snippet}

{#snippet fulfillmentStatus({ onValue, initialValue = '' }: FilterComponentType)}
	<Select
		options={fulfillmentStatuOptions}
		placeholder="Fulfillment status"
		value={initialValue as string}
		onchange={(opt) => opt && onValue((opt as SelectOption).value)}
		size="xs"
	/>
{/snippet}

{#snippet fulfillmentStatuses({ onValue, initialValue = [] }: FilterComponentType)}
	<Select
		options={fulfillmentStatuOptions}
		multiple
		placeholder="Fulfillment statuses"
		value={initialValue as OrderStatus[]}
		onchange={(opts) => {
			if (opts && Array.isArray(opts)) {
				onValue(opts.map((opt) => opt.value as string));
			}
		}}
		size="xs"
	/>
{/snippet}

{#snippet metadataComponent({ onValue, initialValue = [] }: FilterComponentType)}
	{@const keyValue = [(initialValue as string[])[0] || '', (initialValue as string[])[1] || '']}
	<div class="flex flex-col gap-1.5">
		<Input
			size="xs"
			placeholder="key"
			value={keyValue[0]}
			onchange={(evt) => {
				const { value } = evt.target as HTMLInputElement;
				keyValue[0] = value;
				onValue(keyValue);
			}}
		/>
		<Input
			size="xs"
			placeholder="value"
			value={keyValue[1]}
			onchange={(evt) => {
				const { value } = evt.target as HTMLInputElement;
				keyValue[1] = value;
				onValue(keyValue);
			}}
		/>
	</div>
{/snippet}

<FilterManager
	bind:variables
	bind:forceReExecuteGraphqlQuery
	filterOptions={FilterOptions}
	searchKey={'filter.search' as keyof QueryOrdersArgs}
/>
