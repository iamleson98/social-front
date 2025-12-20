<script lang="ts">
	import { T } from '$i18n';
	import { SHOP_ORDERS_QUERY } from '$lib/api/admin/orders';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { SettingCog } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/orders/filter.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import { OrderSortField, type Order, type QueryOrdersArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { orderStatusBadgeClass, paymentStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	const BATCH_LOAD = 20;

	let filterVariables = $state<QueryOrdersArgs>({
		first: BATCH_LOAD,
		filter: {
			search: '',
		},
	});

	let tableRef = $state<GraphqlPaginableTableInterface>();

	const ORDER_TABLE_COLUMNS: TableColumnProps<Order, OrderSortField>[] = $derived([
		{
			title: $T('settings.no'),
			child: no,
			key: OrderSortField.Number,
		},
		{
			title: $T('common.email'),
			child: { render: ({ item }) => item.userEmail },
		},
		{
			title: $T('settings.payment'),
			child: payment,
			key: OrderSortField.Payment,
		},
		{
			title: $T('settings.status'),
			child: status,
			key: OrderSortField.Status,
		},
		{
			title: $T('settings.total'),
			child: total,
		},
		{
			title: $T('settings.date'),
			child: { render: ({ item }) => dayjs(item.created).format(SitenameTimeFormat) },
			key: OrderSortField.CreatedAt,
		},
	]);
</script>

{#snippet no({ item }: { item: Order })}
	<div class="text-center">
		<a href={AppRoute.SETTINGS_ORDERS_DETAILS(item.id)} class="link">
			# {item.number}
		</a>
	</div>
{/snippet}

{#snippet payment({ item }: { item: Order })}
	<Badge rounded {...paymentStatusBadgeClass(item.paymentStatus)} />
{/snippet}

{#snippet status({ item }: { item: Order })}
	<Badge rounded {...orderStatusBadgeClass(item.status)} />
{/snippet}

{#snippet total({ item }: { item: Order })}
	<PriceDisplay amount={item.total.gross.amount} currency={item.total.gross.currency} />
{/snippet}

<div class="mb-2 flex items-center justify-between">
	<Filter bind:variables={filterVariables} {tableRef} />
	<DropDown
		placement="bottom-end"
		options={[
			{
				children: 'Order settings',
				href: AppRoute.SETTINGS_SHOP_ORDER_SETTINGS(),
			},
		]}
	>
		{#snippet trigger({ onclick })}
			<IconButton
				icon={SettingCog}
				size="sm"
				color="gray"
				{onclick}
				class="tooltip tooltip-left"
				data-tip="Order settings"
			/>
		{/snippet}
	</DropDown>
</div>

<GraphqlPaginableTable
	query={SHOP_ORDERS_QUERY}
	bind:variables={filterVariables}
	resultKey="orders"
	requestPolicy="network-only"
	bind:this={tableRef}
	columns={ORDER_TABLE_COLUMNS}
/>
