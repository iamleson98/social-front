<script lang="ts">
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { OrderSortField, type Order, type QueryOrdersArgs } from '$lib/gql/graphql';
	import { orderStatusBadgeClass, paymentStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { tranFunc } from '$i18n';
	import { SHOP_ORDERS_QUERY } from '$lib/api/admin/orders';
	import { Badge } from '$lib/components/ui/Badge';
	import Filter from '$lib/components/pages/settings/orders/filter.svelte';
	import { AppRoute } from '$lib/utils';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { SettingCog } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';

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
		},
		{
			title: $tranFunc('settings.date'),
			child: date,
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

<div class="mb-2 flex items-center justify-between">
	<Filter bind:variables={filterVariables} bind:forceReExecuteGraphqlQuery />
	<DropDown
		placement="bottom-end"
		options={[
			{
				children: 'Order settings',
				href: AppRoute.SETTINGS_SHOP_ORDER_SETTINGS(),
			},
		]}
	>
		{#snippet trigger({ onclick }: DropdownTriggerInterface)}
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
	bind:forceReExecuteGraphqlQuery
	columns={ORDER_TABLE_COLUMNS}
/>
