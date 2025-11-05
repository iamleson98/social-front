<script lang="ts">
	import { tranFunc } from '$i18n';
	import { DRAFT_ORDER_LIST_QUERY } from '$lib/api/admin/orders';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box';
	import { FilterManager } from '$lib/components/common/filter-box';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import {
		OrderSortField,
		type Order,
		type OrderDraftFilterInput,
		type QueryCustomersArgs,
		type QueryDraftOrdersArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { BASIC_DATE_FORMAT, SitenameTimeFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	let variables = $state<QueryDraftOrdersArgs>({
		first: 15,
		filter: { search: '' },
	});
	let forceReExecuteGraphqlQuery = $state(true);
	let loading = $state(false);

	const COLUMNS: TableColumnProps<Order, OrderSortField>[] = [
		{
			title: $tranFunc('common.number'),
			child: number,
			key: OrderSortField.Number,
		},
		{
			title: $tranFunc('settings.date'),
			child: date,
		},
		{
			title: $tranFunc('giftcard.form.customer'),
			child: customer,
			key: OrderSortField.Customer,
		},
		{
			title: $tranFunc('settings.total'),
			child: total,
		},
	];

	const FilterOptions: FilterProps<OrderDraftFilterInput> = $derived({
		customer: {
			label: $tranFunc('giftcard.form.customer'),
			key: 'customer',
			operations: {
				eq: customerFilter,
			},
		},
		created: {
			label: $tranFunc('giftcard.creationDate'),
			key: 'created',
			operations: {
				gte: dateSingle,
				lte: dateSingle,
				range: dateRange,
			},
		},
	});
</script>

{#snippet customerFilter({ onValue, initialValue = '' }: FilterComponentType)}
	<GraphqlPaginableSelect
		size="xs"
		placeholder={$tranFunc('giftcard.form.customer')}
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

{#snippet dateRange({ onValue, initialValue = ['', ''] }: FilterComponentType)}
	{@const range = initialValue as string[]}
	<EaseDatePicker
		size="xs"
		placeholder={$tranFunc('common.range')}
		value={{ start: range[0], end: range[1] }}
		onchange={(vl) => {
			range[0] = dayjs(vl.start).format(BASIC_DATE_FORMAT);
			range[1] = dayjs(vl.end).format(BASIC_DATE_FORMAT);
			onValue(range);
		}}
		allowSelectRange
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

<HeadBar
	listingPageHref={AppRoute.SETTINGS_ORDERS()}
	listingPageLabel={$tranFunc('order.draftOders')}
	newPageHref={AppRoute.SETTINGS_ORDERS_NEW()}
	newPageLabel={$tranFunc('settings.newOrder')}
	detailRouteID="/[[channel]]/settings/shop-orders/[id]"
	detailPageLabelGetter={(page) => page.params.id}
	disabled={loading}
/>

<div class="mb-2">
	<FilterManager
		bind:variables
		searchKey={'filter.search' as keyof QueryDraftOrdersArgs}
		filterOptions={FilterOptions}
		bind:forceReExecuteGraphqlQuery
		variablePatchingCallbackAfterReload={(filterVariables, params) => {
			if (!filterVariables.filter) filterVariables.filter = {};

			const { customer, created, search } = params;

			if (customer) filterVariables.filter.customer = customer.value as string;
			if (created) {
				if (created.operator === 'range' && Array.isArray(created.value))
					filterVariables.filter.created = {
						gte: created.value[0],
						lte: created.value[1],
					};
				else if (['gte', 'lte'].includes(created.operator))
					filterVariables.filter.created = { [created.operator]: created.value };
			}
			if (search && search.value) filterVariables.filter.search = search.value as string;

			return filterVariables;
		}}
	/>
</div>

<GraphqlPaginableTable
	query={DRAFT_ORDER_LIST_QUERY}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	columns={COLUMNS}
	resultKey="draftOrders"
/>
