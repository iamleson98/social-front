<script lang="ts">
	import { operationStore } from '$lib/api/operation';
	import { USER_ORDERS_QUERY } from '$lib/api/orders';
	import { Alert } from '$lib/components/ui/Alert';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { OrderStatus, PaymentChargeStatusEnum, type Order, type Query } from '$lib/gql/graphql';
	import { formatMoney, type PaginationOptions } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { lowerCase, startCase } from 'es-toolkit';

	const BATCH_LOAD = 20;

	const userOrdersStore = operationStore<Pick<Query, 'me'>, PaginationOptions>({
		kind: 'query',
		requestPolicy: 'cache-and-network',
		query: USER_ORDERS_QUERY,
		variables: {
			first: BATCH_LOAD
		}
	});

	const paymentStatusBuilder = (status: PaymentChargeStatusEnum) => {
		// NOTE: Those badge classes are found on: https://v5.daisyui.com/components/badge/
		let badgeClass = 'badge-success';

		switch (status) {
			case PaymentChargeStatusEnum.Cancelled:
				badgeClass = 'badge-error';
				break;
			case PaymentChargeStatusEnum.FullyCharged:
				badgeClass = 'badge-success';
				break;
			case PaymentChargeStatusEnum.FullyRefunded:
				badgeClass = 'badge-primary';
				break;
			case PaymentChargeStatusEnum.NotCharged:
				badgeClass = 'badge-warning';
				break;
			case PaymentChargeStatusEnum.PartiallyCharged:
				badgeClass = 'badge-info';
				break;
			case PaymentChargeStatusEnum.PartiallyRefunded:
				badgeClass = 'badge-accent';
				break;
			case PaymentChargeStatusEnum.Pending:
				badgeClass = 'badge-dash! badge-neutral';
				break;
			case PaymentChargeStatusEnum.Refused:
				badgeClass = 'badge-neutral';
				break;
		}

		return `<div class="badge badge-outline ${badgeClass} badge-sm">${startCase(lowerCase(status.replace(/_/g, ' ')))}</div>`;
	};

	const orderStatusBuider = (status: OrderStatus) => {
		// NOTE: Those badge classes are found on: https://v5.daisyui.com/components/badge/
		let badge = 'badge-success';

		switch (status) {
			case OrderStatus.Canceled:
				badge = 'badge-error';
				break;
			case OrderStatus.Draft:
				badge = 'badge-neutral';
				break;
			case OrderStatus.Expired:
				badge = 'badge-secondary';
				break;
			case OrderStatus.Fulfilled:
				badge = 'badge-success';
				break;
			case OrderStatus.PartiallyFulfilled:
				badge = 'badge-accent';
				break;
			case OrderStatus.PartiallyReturned:
				badge = 'badge-info';
				break;
			case OrderStatus.Returned:
				badge = 'badge-warning';
				break;
			case OrderStatus.Unconfirmed:
				badge = 'badge-dash! badge-neutral';
				break;
			case OrderStatus.Unfulfilled:
				badge = 'badge-neutral';
				break;
		}

		return `<div class="badge ${badge} badge-sm">${startCase(lowerCase(status.replace(/_/g, ' ')))}</div>`;
	};

	const ORDER_TABLE_COLUMNS: TableColumnProps<Order>[] = [
		{
			title: 'No',
			getter: (item) => item.number,
			sortable: true
		},
		{
			title: 'Date',
			getter: (item) => dayjs(item.created).format('MMMM D, YYYY [at] h:mm A'),
			sortable: true
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
			getter: (item) => formatMoney(item.total.gross.currency, item.total.gross.amount)
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
