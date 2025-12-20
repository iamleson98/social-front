<script lang="ts">
	import { T } from '$i18n';
	import { USER_ORDERS_QUERY } from '$lib/api/orders';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { Dots } from '$lib/components/icons';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Order, type Query } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import {
		orderStatusBadgeClass,
		paymentStatusBadgeClass,
		type PaginationOptions,
	} from '$lib/utils/utils';
	import dayjs from 'dayjs';

	const BATCH_LOAD = 20;

	let filterVariables = $state<PaginationOptions>({
		first: BATCH_LOAD,
	});

	const ORDER_TABLE_COLUMNS: TableColumnProps<Order, any>[] = $derived([
		{
			title: $T('settings.no'),
			child: { render: ({ item }) => item.number },
		},
		{
			title: $T('settings.date'),
			child: { render: ({ item }) => dayjs(item.created).format(SitenameTimeFormat) },
		},
		{
			title: $T('settings.payment'),
			child: payment,
		},
		{
			title: $T('settings.status'),
			child: status,
		},
		{
			title: $T('settings.total'),
			child: total,
		},
		{
			title: $T('settings.action'),
			child: action,
		},
	]);
</script>

{#snippet payment({ item }: { item: Order })}
	<Badge {...paymentStatusBadgeClass(item.paymentStatus)} rounded />
{/snippet}

{#snippet status({ item }: { item: Order })}
	<Badge {...orderStatusBadgeClass(item.status)} rounded />
{/snippet}

{#snippet total({ item }: { item: Order })}
	<PriceDisplay {...item.total.gross} />
{/snippet}

{#snippet action({ item }: { item: Order })}
	<div class="flex justify-center">
		<DropDown
			placement="bottom-end"
			options={[
				{
					children: $T('settings.reqSupport'),
					href: `${AppRoute.ME_SUPPORT_NEW()}?order_number=${item.number}`,
				},
			]}
		>
			{#snippet trigger({ ...rest })}
				<IconButton icon={Dots} {...rest} size="xs" variant="light" color="gray" />
			{/snippet}
		</DropDown>
	</div>
{/snippet}

<HeadBar
	listingPageHref={AppRoute.SETTINGS_ORDERS()}
	listingPageLabel={$T('settings.myOrders')}
	detailRouteID="/[[channel]]/settings/orders/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<GraphqlPaginableTable
	query={USER_ORDERS_QUERY}
	columns={ORDER_TABLE_COLUMNS}
	bind:variables={filterVariables}
	resultKey={'me.orders' as keyof Query}
	autoFetchDataOnMount
	autoRefetchOnPaginationParamsChange
/>
