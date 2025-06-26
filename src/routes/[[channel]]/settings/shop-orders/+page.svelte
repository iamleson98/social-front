<script lang="ts">
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { OrderSortField, type Order, type QueryOrdersArgs } from '$lib/gql/graphql';
	import { orderStatusBadgeClass, paymentStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { tranFunc } from '$i18n';
	import { SHOP_ORDERS_QUERY } from '$lib/api/admin/orders';
	import { Badge } from '$lib/components/ui/badge';
	import Filter from '$lib/components/pages/settings/orders/filter.svelte';
	import { AppRoute } from '$lib/utils';
	import PriceDisplay from '$lib/components/common/price-display.svelte';

	const BATCH_LOAD = 20;

	let filterVariables = $state<QueryOrdersArgs>({
		first: BATCH_LOAD,
		filter: {
			search: '',
		},
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
	<div class="text-center">
		<a href={AppRoute.SETTINGS_ORDERS_DETAILS(item.id)} class="link link-hover">
			# {item.number}
		</a>
	</div>
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
	<PriceDisplay amount={item.total.gross.amount} currency={item.total.gross.currency} />
{/snippet}

{#snippet email({ item }: { item: Order })}
	{item.userEmail}
{/snippet}

<Filter bind:variables={filterVariables} bind:forceReExecuteGraphqlQuery />

<GraphqlPaginableTable
	query={SHOP_ORDERS_QUERY}
	bind:variables={filterVariables}
	resultKey="orders"
	bind:forceReExecuteGraphqlQuery
	columns={ORDER_TABLE_COLUMNS}
/>
