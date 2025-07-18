<script lang="ts">
	import { USER_ORDERS_QUERY } from '$lib/api/orders';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Order, type Query } from '$lib/gql/graphql';
	import {
		orderStatusBadgeClass,
		paymentStatusBadgeClass,
		type PaginationOptions,
	} from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import { IconButton } from '$lib/components/ui/Button';
	import { Dots } from '$lib/components/icons';
	import { AppRoute } from '$lib/utils';
	import { tranFunc } from '$i18n';
	import { Badge } from '$lib/components/ui/badge';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import PriceDisplay from '$lib/components/common/price-display.svelte';

	const BATCH_LOAD = 20;

	let filterVariables = $state<PaginationOptions>({
		first: BATCH_LOAD,
	});
	let forceReExecuteGraphqlQuery = $state<boolean>(true);

	const ORDER_TABLE_COLUMNS: TableColumnProps<Order, any>[] = $derived([
		{
			title: $tranFunc('settings.no'),
			child: no,
		},
		{
			title: $tranFunc('settings.date'),
			child: date,
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
			title: $tranFunc('settings.action'),
			child: action,
		},
	]);
</script>

{#snippet no({ item }: { item: Order })}
	{item.number}
{/snippet}

{#snippet date({ item }: { item: Order })}
	{dayjs(item.created).format(SitenameTimeFormat)}
{/snippet}

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
			options={[
				{
					children: $tranFunc('settings.reqSupport'),
					href: `${AppRoute.ME_SUPPORT_NEW()}?order_number=${item.number}`,
				},
			]}
		>
			{#snippet trigger({ ...rest }: DropdownTriggerInterface)}
				<IconButton icon={Dots} {...rest} size="xs" variant="light" color="gray" />
			{/snippet}
		</DropDown>
	</div>
{/snippet}

<HeadBar
	listingPageHref={AppRoute.SETTINGS_ORDERS()}
	listingPageLabel={$tranFunc('settings.myOrders')}
	detailRouteID="/[[channel]]/settings/orders/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<GraphqlPaginableTable
	query={USER_ORDERS_QUERY}
	columns={ORDER_TABLE_COLUMNS}
	bind:variables={filterVariables}
	resultKey={'me.orders' as keyof Query}
	bind:forceReExecuteGraphqlQuery
/>
