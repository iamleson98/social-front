<script lang="ts">
	import { CUSTOMER_ORDERS_QUERY } from '$lib/api/admin/orders';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/Badge';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Order, OrderSortField, type Query, type QueryOrdersArgs } from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { paymentStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	type Props = {
		id: string;
		disabled?: boolean;
	};

	let { id, disabled }: Props = $props();

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
	<span class="whitespace-nowrap">{dayjs(item.created).format(SitenameTimeFormat)}</span>
{/snippet}

{#snippet status({ item }: { item: Order })}
	<Badge {...paymentStatusBadgeClass(item.paymentStatus)} />
{/snippet}

{#snippet total({ item }: { item: Order })}
	<PriceDisplay amount={item.total.gross.amount} currency={item.total.gross.currency} />
{/snippet}

<div class="bg-white rounded-lg border border-gray-200 p-3">
	<SectionHeader class="mb-3">
		<div>Recent Orders</div>
		<Button variant="light" size="xs" {disabled}>View all orders</Button>
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
		{disabled}
	/>
</div>
