<script lang="ts">
	import { operationStore } from '$lib/api/operation';
	import { USER_ORDERS_QUERY } from '$lib/api/orders';
	import { Alert } from '$lib/components/ui/Alert';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Order, type Query } from '$lib/gql/graphql';
	import { formatMoney, type PaginationOptions } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { orderStatusBadgeClass, paymentStatusBadgeClass } from './utils';
	import { lowerCase, startCase } from 'es-toolkit';
	import { DropDown, type DropdownTriggerInterface } from '$lib/components/ui/Dropdown';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Dots, Plus } from '$lib/components/icons';
	import { AppRoute } from '$lib/utils';

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
			// sortable: true,
			child: no
		},
		{
			title: 'Date',
			child: date
			// sortable: true
		},
		{
			title: 'Payment',
			child: payment
		},
		{
			title: 'Status',
			child: status
		},
		{
			title: 'Total',
			child: total
		},
		{
			title: 'Action',
			child: action
		}
	];
</script>

{#snippet no({ item }: { item: Order })}
	{item.number}
{/snippet}

{#snippet date({ item }: { item: Order })}
	{dayjs(item.created).format('MMMM D, YYYY [at] h:mm A')}
{/snippet}

{#snippet payment({ item }: { item: Order })}
	<div class="{paymentStatusBadgeClass(item.paymentStatus)} badge badge-outline badge-sm">
		{startCase(lowerCase(item.paymentStatus.replace(/_/g, ' ')))}
	</div>
{/snippet}

{#snippet status({ item }: { item: Order })}
	<div class="{orderStatusBadgeClass(item.status)} badge badge-sm">
		{startCase(lowerCase(item.status.replace(/_/g, ' ')))}
	</div>
{/snippet}

{#snippet total({ item }: { item: Order })}
	<div class="font-semibold text-blue-600">
		{formatMoney(item.total.gross.currency, item.total.gross.amount)}
	</div>
{/snippet}

{#snippet action({ item }: { item: Order })}
	{#snippet trigger({ ...rest }: DropdownTriggerInterface)}
		<IconButton icon={Dots} {...rest} size="xs" variant="light" color="gray" />
	{/snippet}
	<DropDown
		{trigger}
		options={[
			{
				children: 'Request support',
				href: `${AppRoute.ME_SUPPORT_NEW()}?order_number=${item.number}`
			}
		]}
	/>
{/snippet}


<div class="mt-3 rounded-lg bg-white border border-gray-200 p-3 flex items-center justify-between">
	<div>Orders</div>
	<div>
		<Button size="xs" endIcon={Plus} href={AppRoute.ME_SUPPORT_NEW()}>New Order</Button>
	</div>
</div>

<div class="rounded-lg bg-white border border-gray-200 p-3 mt-3">
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
