<script lang="ts">
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { Table, TableSkeleton, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Order, type Query, type QueryOrdersArgs } from '$lib/gql/graphql';
	import { formatCurrency, orderStatusBadgeClass, paymentStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { lowerCase, startCase } from 'es-toolkit';
	import { tranFunc } from '$i18n';
	import { SHOP_ORDERS_QUERY } from '$lib/api/admin/orders';
	import { Badge } from '$lib/components/ui/badge';

	const BATCH_LOAD = 20;

	const shopOrdersQuery = operationStore<Pick<Query, 'orders'>, QueryOrdersArgs>({
		kind: 'query',
		requestPolicy: 'cache-and-network',
		query: SHOP_ORDERS_QUERY,
		variables: {
			first: BATCH_LOAD
		}
	});

	const ORDER_TABLE_COLUMNS: TableColumnProps<Order>[] = $derived([
		{
			title: $tranFunc('settings.no'),
			// sortable: true,
			child: no
		},
		{
			title: $tranFunc('common.email'),
			child: email
		},
		{
			title: $tranFunc('settings.payment'),
			child: payment
		},
		{
			title: $tranFunc('settings.status'),
			child: status
		},
		{
			title: $tranFunc('settings.total'),
			child: total,
			sortable: true
		},
		{
			title: $tranFunc('settings.date'),
			child: date,
			sortable: true
		}
	]);
</script>

{#snippet no({ item }: { item: Order })}
	{item.number}
{/snippet}

{#snippet date({ item }: { item: Order })}
	{dayjs(item.created).format('DD/MM/YYYY h:mm A')}
{/snippet}

{#snippet payment({ item }: { item: Order })}
	<Badge
		{...paymentStatusBadgeClass(item.paymentStatus)}
		text={startCase(lowerCase(item.paymentStatus.replace(/_/g, ' ')))}
	/>
{/snippet}

{#snippet status({ item }: { item: Order })}
	<Badge
		{...orderStatusBadgeClass(item.status)}
		text={startCase(lowerCase(item.status.replace(/_/g, ' ')))}
	/>
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

<div class="rounded-lg bg-white border border-gray-200 p-4 mt-3">
	{#if $shopOrdersQuery.fetching}
		<TableSkeleton numColumns={6} showPagination />
	{:else if $shopOrdersQuery.error}
		<Alert variant="error" size="sm" bordered>{$shopOrdersQuery.error.message}</Alert>
	{:else if $shopOrdersQuery.data}
		{@const items = $shopOrdersQuery.data.orders?.edges.map((item) => item.node) || []}
		<Table
			{items}
			columns={ORDER_TABLE_COLUMNS}
			pagination={$shopOrdersQuery.data.orders?.pageInfo}
			onNextPagelick={(cursor) =>
				shopOrdersQuery.reexecute({ variables: { first: BATCH_LOAD, after: cursor } })}
			onPreviousPagelick={(cursor) =>
				shopOrdersQuery.reexecute({ variables: { last: BATCH_LOAD, before: cursor } })}
			onChangeRowsPerPage={(no) => shopOrdersQuery.reexecute({ variables: { first: no } })}
		/>
	{/if}
</div>
