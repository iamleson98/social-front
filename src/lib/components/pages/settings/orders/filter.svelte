<script lang="ts">
	import { SHOP_ORDERS_QUERY } from '$lib/api/admin/orders';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { CommonSnippets } from '$lib/components/common/filter-box/snippets.svelte';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box/types';
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
	import { orderStatusBadgeClass, paymentStatusBadgeClass } from '$lib/utils/utils';

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
				oneOf: CommonSnippets.multiChannelIds,
			},
		},
		created: {
			label: 'Creation date',
			operations: {
				lte: CommonSnippets.singleDate,
				gte: CommonSnippets.singleDate,
				range: CommonSnippets.dateRange,
			},
		},
		updatedAt: {
			label: 'Updated at',
			operations: {
				lte: CommonSnippets.singleDate,
				gte: CommonSnippets.singleDate,
				range: CommonSnippets.dateRange,
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
				eq: CommonSnippets.yesNo,
			},
		},
		isPreorder: {
			label: 'Is preorder',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		giftCardUsed: {
			label: 'Gift card used',
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		giftCardBought: {
			label: 'Gift card bought',
			operations: {
				eq: CommonSnippets.yesNo,
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
				eq: CommonSnippets.metadata,
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
		variables={{ first: 15 }}
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

<FilterManager
	bind:variables
	bind:forceReExecuteGraphqlQuery
	filterOptions={FilterOptions}
	searchKey={'filter.search' as keyof QueryOrdersArgs}
	variablePatchingCallbackAfterReload={(filterVariables, searchParams) => {
		const {
			customer,
			metadata,
			chargeStatus,
			ids,
			channels,
			created,
			updatedAt,
			paymentStatus,
			status,
			isClickAndCollect,
			isPreorder,
			giftCardBought,
			giftCardUsed,
			authorizeStatus,
		} = searchParams;

		if (!filterVariables.filter) filterVariables.filter = {};

		if (customer) filterVariables.filter.customer = customer.value as string;
		if (metadata)
			filterVariables.filter.metadata = [
				{
					key: (metadata.value as string[])[0],
					value: (metadata.value as string[])[1],
				},
			];

		if (chargeStatus) {
			let value: OrderChargeStatusEnum[] = [];
			if (chargeStatus.operator === 'eq') value = [chargeStatus.value as OrderChargeStatusEnum];
			else if (chargeStatus.operator === 'oneOf')
				value = chargeStatus.value as OrderChargeStatusEnum[];
			filterVariables.filter.chargeStatus = value;
		}
		if (ids && Array.isArray(ids.value)) filterVariables.filter.ids = ids.value as string[];
		if (channels && Array.isArray(channels.value))
			filterVariables.filter.channels = channels.value as string[];
		if (created) {
			if (created.operator === 'range' && Array.isArray(created.value))
				filterVariables.filter.created = {
					gte: created.value[0],
					lte: created.value[1],
				};
			else if (['gte', 'lte'].includes(created.operator))
				filterVariables.filter.created = { [created.operator]: created.value };
		}
		if (updatedAt) {
			if (updatedAt.operator === 'range' && Array.isArray(updatedAt.value))
				filterVariables.filter.updatedAt = {
					gte: updatedAt.value[0],
					lte: updatedAt.value[1],
				};
			else if (['gte', 'lte'].includes(updatedAt.operator))
				filterVariables.filter.updatedAt = { [updatedAt.operator]: updatedAt.value };
		}
		if (paymentStatus) {
			if (paymentStatus.operator === 'eq')
				filterVariables.filter.paymentStatus = [paymentStatus.value] as PaymentChargeStatusEnum[];
			else if (paymentStatus.operator === 'oneOf')
				filterVariables.filter.paymentStatus = paymentStatus.value as PaymentChargeStatusEnum[];
		}
		if (status) {
			if (status.operator === 'eq')
				filterVariables.filter.status = [status.value] as OrderStatusFilter[];
			else if (status.operator === 'oneOf')
				filterVariables.filter.status = status.value as OrderStatusFilter[];
		}
		if (isClickAndCollect)
			filterVariables.filter.isClickAndCollect = isClickAndCollect.value as boolean;
		if (isPreorder) filterVariables.filter.isPreorder = isPreorder.value as boolean;
		if (giftCardBought) filterVariables.filter.giftCardBought = giftCardBought.value as boolean;
		if (giftCardUsed) filterVariables.filter.giftCardUsed = giftCardUsed.value as boolean;
		if (authorizeStatus) {
			if (authorizeStatus.operator === 'oneOf' && Array.isArray(authorizeStatus.value))
				filterVariables.filter.authorizeStatus =
					authorizeStatus.value as OrderAuthorizeStatusEnum[];
			else
				filterVariables.filter.authorizeStatus = [
					authorizeStatus.value,
				] as OrderAuthorizeStatusEnum[];
		}

		return filterVariables;
	}}
/>
