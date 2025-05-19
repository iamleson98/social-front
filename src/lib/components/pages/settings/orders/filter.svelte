<script lang="ts">
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { FilterButton } from '$lib/components/common/filter-box';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box/types';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		OrderStatus,
		OrderStatusFilter,
		PaymentChargeStatusEnum,
		type OrderFilterInput,
	} from '$lib/gql/graphql';
	import { orderStatusBadgeClass, paymentStatusBadgeClass } from '$lib/utils/utils';

	const FILTER_OPTIONS: FilterProps<OrderFilterInput>[] = [
		{
			label: 'IDs',
			key: 'ids',
			operations: [
				{
					operator: 'eq',
					component: orderId,
				},
			],
		},
		{
			label: 'Channels',
			key: 'channels',
			operations: [
				{
					operator: 'oneOf',
					component: channels,
				},
			],
		},
		{
			label: 'Payment status',
			key: 'paymentStatus',
			operations: [
				{
					operator: 'eq',
					component: paymentStatus,
				},
				{
					operator: 'oneOf',
					component: paymentStatuses,
				},
			],
		},
		{
			label: 'Fulfillment status',
			key: 'status',
			operations: [
				{
					operator: 'eq',
					component: fulfillmentStatus,
				},
				{
					operator: 'oneOf',
					component: fulfillmentStatuses,
				},
			],
		},
		{
			label: 'Click and collect',
			key: 'created',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: 'Is preorder',
			key: 'isPreorder',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: 'Gift card used',
			key: 'giftCardUsed',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
		{
			label: 'Gift card bought',
			key: 'giftCardBought',
			operations: [
				{
					operator: 'eq',
					component: yesNo,
				},
			],
		},
	];

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

{#snippet orderId({ onValue, initialValue }: FilterComponentType)}
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

{#snippet channels({ onValue, initialValue = [] }: FilterComponentType)}
	<ChannelSelect
		size="xs"
		multiple
		onchange={(opt) => {
			if (opt && Array.isArray(opt)) {
				onValue(opt.map((opt) => opt.value as string));
			}
		}}
		value={initialValue as string[]}
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

{#snippet glte({ onValue, initialValue = [] }: FilterComponentType)}
	<EaseDatePicker />
{/snippet}

<FilterButton filterOptions={FILTER_OPTIONS} />
