<script lang="ts">
	import { operationStore } from '$lib/api/operation';
	import { USER_ORDERS_QUERY } from '$lib/api/orders';
	import { Alert } from '$lib/components/ui/Alert';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Order, type Query } from '$lib/gql/graphql';
	import {
		formatMoney,
		orderStatusBuider,
		paymentStatusBuilder,
		type PaginationOptions
	} from '$lib/utils/utils';
	import dayjs from 'dayjs';

	const BATCH_LOAD = 20;

	const userOrdersStore = operationStore<Pick<Query, 'me'>, PaginationOptions>({
		kind: 'query',
		requestPolicy: 'cache-and-network',
		query: USER_ORDERS_QUERY,
		variables: {
			first: BATCH_LOAD
		}
	});

	const ORDER_TABLE_COLUMNS: TableColumnProps<Order>[] = [
		{
			title: 'No',
			getter: (item) => item.number,
			// sortable: true
		},
		{
			title: 'Date',
			getter: (item) => dayjs(item.created).format('MMMM D, YYYY [at] h:mm A'),
			// sortable: true
		},
		{
			title: 'Payment',
			getter: (item) => paymentStatusBuilder(item.paymentStatus)
		},
		{
			title: 'Status',
			getter: (item) => orderStatusBuider(item.status)
		},
		{
			title: 'Total',
			getter: (item) => `<div class="font-semibold text-blue-600">${formatMoney(item.total.gross.currency, item.total.gross.amount)}</div>`
		}
	];
</script>

<div class="rounded-lg bg-white border border-gray-200 p-4">
	{#if $userOrdersStore.fetching}
		<SkeletonContainer>
			<Skeleton class="h-4 w-full" />
		</SkeletonContainer>
	{:else if $userOrdersStore.error}
		<Alert variant="error" size="sm" bordered>{$userOrdersStore.error.message}</Alert>
	{:else if $userOrdersStore.data?.me}
		{@const items = $userOrdersStore.data.me.orders?.edges.map((item) => item.node) || []}
		<Table
			{items}
			columns={ORDER_TABLE_COLUMNS}
			pagination={$userOrdersStore.data.me.orders?.pageInfo}
			onNextPagelick={(cursor) =>
				userOrdersStore.reexecute({ variables: { first: BATCH_LOAD, after: cursor } })}
			onPreviousPagelick={(cursor) =>
				userOrdersStore.reexecute({ variables: { last: BATCH_LOAD, before: cursor } })}
			onChangeRowsPerPage={(no) => userOrdersStore.reexecute({ variables: { first: no } })}
		/>
	{/if}
</div>
