<script lang="ts">
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { OrderSortField, type Order, type QueryOrdersArgs } from '$lib/gql/graphql';
	import { formatCurrency, orderStatusBadgeClass, paymentStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { tranFunc } from '$i18n';
	import { SHOP_ORDERS_QUERY } from '$lib/api/admin/orders';
	import { Badge } from '$lib/components/ui/badge';
	import Filter from '$lib/components/pages/settings/orders/filter.svelte';
	import { Search } from '$lib/components/icons';
	import { Input } from '$lib/components/ui/Input';
	import { AppRoute } from '$lib/utils';

	const BATCH_LOAD = 20;

	let filterVariables = $state<QueryOrdersArgs>({
		first: BATCH_LOAD,
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const ORDER_TABLE_COLUMNS: TableColumnProps<Order, OrderSortField>[] = $derived([
		{
			title: $tranFunc('settings.no'),
			sortable: true,
			child: no,
			key: OrderSortField.Number,
		},
		{
			title: $tranFunc('common.email'),
			child: email,
		},
		{
			title: $tranFunc('settings.payment'),
			child: payment,
		},
		{
			title: $tranFunc('settings.status'),
			child: status,
		},
		{
			title: $tranFunc('settings.total'),
			child: total,
			// sortable: true
		},
		{
			title: $tranFunc('settings.date'),
			child: date,
			// sortable: true
		},
	]);
</script>

{#snippet no({ item }: { item: Order })}
	<a href={AppRoute.SETTINGS_ORDERS_DETAILS(item.id)} class="link">
		{item.number}
	</a>
{/snippet}

{#snippet date({ item }: { item: Order })}
	{dayjs(item.created).format('DD/MM/YYYY h:mm A')}
{/snippet}

{#snippet payment({ item }: { item: Order })}
	<Badge {...paymentStatusBadgeClass(item.paymentStatus)} />
{/snippet}

{#snippet status({ item }: { item: Order })}
	<Badge {...orderStatusBadgeClass(item.status)} />
{/snippet}

{#snippet total({ item }: { item: Order })}
	<div class="flex items-center justify-between gap-1">
		<span class="text-gray-500 text-xs">{item.total.gross.currency}</span>
		<span class="font-semibold text-blue-600 text-right">
			{formatCurrency(item.total.gross.amount)}
		</span>
	</div>
{/snippet}

<!-- {#snippet action({ item }: { item: Order })}
	{#snippet trigger({ ...rest }: DropdownTriggerInterface)}
		<IconButton icon={Dots} {...rest} size="xs" variant="light" color="gray" />
	{/snippet}
	<DropDown
		{trigger}
		options={[
			{
				children: $tranFunc('settings.reqSupport'),
				href: `${AppRoute.ME_SUPPORT_NEW()}?order_number=${item.number}`
			}
		]}
	/>
{/snippet} -->

{#snippet email({ item }: { item: Order })}
	{item.userEmail}
{/snippet}

<div class="flex mb-2 items-center gap-2">
	<Filter />
	<Input size="sm" placeholder="Enter query" startIcon={Search} />
</div>

<GraphqlPaginableTable
	query={SHOP_ORDERS_QUERY}
	bind:variables={filterVariables}
	resultKey="orders"
	bind:forceReExecuteGraphqlQuery
	columns={ORDER_TABLE_COLUMNS}
/>
