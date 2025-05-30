<script lang="ts">
	import { CUSTOMER_ORDERS_QUERY } from '$lib/api/admin/orders';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Order, OrderSortField, type Query, type QueryOrdersArgs } from '$lib/gql/graphql';
	import { formatCurrency, paymentStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	type Props = {
		id: string;
	};

	let { id }: Props = $props();

	const ORDER_TABLE_COLUMNS: TableColumnProps<Order, OrderSortField>[] = [
		{
			title: 'Number',
			child: number,
		},
		{
			title: 'Date',
			child: date,
		},
		{
			title: 'Status',
			child: status,
		},
		{
			title: 'Total',
			child: total,
		},
	];

	let forceReExecuteGraphqlQuery = $state(true);
</script>

{#snippet number({ item }: { item: Order })}
	<span>{item.number}</span>
{/snippet}

{#snippet date({ item }: { item: Order })}
	<span class="whitespace-nowrap">{dayjs(item.created).format('DD/MM/YYYY HH:mm')}</span>
{/snippet}

{#snippet status({ item }: { item: Order })}
	<Badge {...paymentStatusBadgeClass(item.paymentStatus)} />
{/snippet}

{#snippet total({ item }: { item: Order })}
	<div class="flex items-center justify-between gap-1">
		<span class="text-gray-500 text-xs">{item.total.gross.currency}</span>
		<span class="font-semibold text-blue-600 text-right">
			{formatCurrency(item.total.gross.amount)}
		</span>
	</div>
{/snippet}

<div class="bg-white rounded-lg border border-gray-200 p-3">
	<SectionHeader class="mb-3">
		<div>Recent Orders</div>
		<Button variant="light" size="xs">View all orders</Button>
	</SectionHeader>
	<GraphqlPaginableTable
		query={CUSTOMER_ORDERS_QUERY}
		variables={{
			id,
			first: 10,
		} as QueryOrdersArgs}
		columns={ORDER_TABLE_COLUMNS}
		resultKey={'user.orders' as keyof Query}
		bind:forceReExecuteGraphqlQuery
	/>
</div>
