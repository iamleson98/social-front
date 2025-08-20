<script lang="ts">
	import { DRAFT_ORDER_LIST_QUERY } from '$lib/api/admin/orders';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box';
	import FilterManager from '$lib/components/common/filter-box/filter-manager.svelte';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		OrderSortField,
		type Order,
		type OrderDraftFilterInput,
		type QueryCustomersArgs,
		type QueryDraftOrdersArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	let variables = $state<QueryDraftOrdersArgs>({
		first: 15,
		filter: { search: '' },
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const COLUMNS: TableColumnProps<Order, OrderSortField>[] = [
		{
			title: 'Number',
			child: number,
			key: OrderSortField.Number,
		},
		{
			title: 'Date',
			child: date,
		},
		{
			title: 'Customer',
			child: customer,
			key: OrderSortField.Customer,
		},
		{
			title: 'Total',
			child: total,
		},
	];

	const FILTERS: FilterProps<OrderDraftFilterInput>[] = [
		{
			label: 'Customer',
			key: 'customer',
			operations: [
				{
					operator: 'eq',
					component: customerFilter,
				},
			],
		},
		{
			label: 'Creation Date',
			key: 'created',
			operations: [
				{
					operator: 'gte',
					component: dateSingle,
				},
				{
					operator: 'lte',
					component: dateSingle,
				},
				{
					operator: 'range',
					component: dateRange,
				},
			],
		},
	];
</script>

{#snippet customerFilter({ onValue, initialValue = '' }: FilterComponentType)}
	<GraphqlPaginableSelect
		size="xs"
		placeholder="Customer"
		query={CUSTOMER_LIST_QUERY}
		optionLabelKey="email"
		optionValueKey="id"
		variables={{ first: 20, filter: { search: '' } } as QueryCustomersArgs}
		variableSearchQueryPath="filter.search"
		resultKey="customers"
		value={initialValue}
		onchange={(opt) => onValue((opt as SelectOption)?.value)}
	/>
{/snippet}

{#snippet dateSingle({ onValue, initialValue = '', placeholder }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		{placeholder}
		value={{ date: initialValue ? dayjs(initialValue as string).toDate() : undefined }}
		onchange={(value) => onValue(dayjs(value.date).format())}
		timeConfig={false}
	/>
{/snippet}

{#snippet dateRange({ onValue, initialValue = '', placeholder }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		{placeholder}
		value={{ date: initialValue ? dayjs(initialValue as string).toDate() : undefined }}
		onchange={(value) => onValue(dayjs(value.date).format())}
		timeConfig={false}
	/>
{/snippet}

{#snippet number({ item }: { item: Order })}
	<a href={AppRoute.SETTINGS_ORDERS_DETAILS(item.id)} class="link"># {item.number}</a>
{/snippet}

{#snippet date({ item }: { item: Order })}
	<span>{dayjs(item.created).format(SitenameTimeFormat)}</span>
{/snippet}

{#snippet customer({ item }: { item: Order })}
	{#if item.userEmail}
		<span>{item.userEmail}</span>
	{:else if item.user}
		<span>{item.user.firstName} {item.user.lastName}</span>
	{/if}
{/snippet}

{#snippet total({ item }: { item: Order })}
	<PriceDisplay {...item.total.gross} />
{/snippet}

<div class="mb-2">
	<FilterManager
		bind:variables
		searchKey={'filter.search' as keyof QueryDraftOrdersArgs}
		filterOptions={FILTERS}
		bind:forceReExecuteGraphqlQuery
	/>
</div>

<GraphqlPaginableTable
	query={DRAFT_ORDER_LIST_QUERY}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	columns={COLUMNS}
	resultKey="draftOrders"
/>
