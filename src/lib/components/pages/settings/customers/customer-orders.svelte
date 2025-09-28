<script lang="ts">
	import { CUSTOMER_ORDERS_QUERY } from '$lib/api/admin/orders';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { ExternalLink } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/Badge';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Order, OrderSortField, type Query, type QueryOrdersArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { paymentStatusBadgeClass, SitenameCommonClassName } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	type Props = {
		id: string;
		disabled?: boolean;
		email: string;
	};

	let { id, disabled, email }: Props = $props();

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

<div class={SitenameCommonClassName}>
	<SectionHeader class="mb-3">
		<div>Recent Orders</div>
		<Button
			variant="light"
			size="xs"
			{disabled}
			href="{AppRoute.SETTINGS_ORDERS()}?customer={email}"
			target="_blank"
			endIcon={ExternalLink}
		>
			View all orders
		</Button>
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
