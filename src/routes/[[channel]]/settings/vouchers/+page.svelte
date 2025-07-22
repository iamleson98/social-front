<script lang="ts">
	import { VOUCHER_LIST_QUERY } from '$lib/api/admin/discount';
	import Filter from '$lib/components/pages/settings/vouchers/filter.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { VoucherSortField, type QueryVouchersArgs, type Voucher } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { formatCurrency } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	let variables = $state<QueryVouchersArgs>({
		first: 10,
		filter: {
			search: '',
		},
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const VOUCHER_COLUMNS: TableColumnProps<Voucher, VoucherSortField>[] = [
		{
			title: 'Voucher',
			child: title,
			key: VoucherSortField.Name,
		},
		{
			title: 'Min. Spent',
			child: minSpent,
		},
		{
			title: 'Value',
			child: value,
		},
		{
			title: 'Usage limit',
			child: useLimit,
		},
		{
			title: 'Availability',
			child: availability,
		},
		{
			title: 'Start date',
			child: startDate,
			key: VoucherSortField.StartDate,
		},
		{
			title: 'End date',
			child: endDate,
			key: VoucherSortField.EndDate,
		},
	];
</script>

{#snippet title({ item }: { item: Voucher })}
	<a href={AppRoute.SETTINGS_CONFIGS_VOUCHER_DETAIL(item.id)} class="link">
		{item.name}
	</a>
{/snippet}

{#snippet useLimit({ item }: { item: Voucher })}
	<div class="text-sm font-medium text-gray-800 text-center">{item.usageLimit || '-'}</div>
{/snippet}

{#snippet availability({ item }: { item: Voucher })}
	<Badge
		text="{item.channelListings?.length || 0} channels"
		color="green"
		class="tooltip tooltip-top"
		data-tip={item.channelListings?.map((list) => list.channel.slug).join(', ')}
	/>
{/snippet}

{#snippet minSpent({ item }: { item: Voucher })}
	{#each item.channelListings || [] as listing, idx (idx)}
		<div class="flex items-center justify-between gap-1">
			<span class="text-gray-500 text-xs">{listing.currency}</span>
			<span class="font-semibold text-blue-600 text-right">
				{formatCurrency(listing.minSpent?.amount || 0)}
			</span>
		</div>
	{/each}
{/snippet}

{#snippet value({ item }: { item: Voucher })}
	{#each item.channelListings || [] as listing, idx (idx)}
		<div class="flex items-center justify-between gap-1">
			<span class="text-gray-500 text-xs">{listing.currency}</span>
			<span class="font-semibold text-blue-600 text-right">
				{formatCurrency(listing.discountValue)}
			</span>
		</div>
	{/each}
{/snippet}

{#snippet startDate({ item }: { item: Voucher })}
	<div class="text-sm font-medium text-gray-600">
		{dayjs(item.startDate).format(SitenameTimeFormat)}
	</div>
{/snippet}

{#snippet endDate({ item }: { item: Voucher })}
	<div class="text-sm font-medium text-gray-600 text-center">
		{item.endDate ? dayjs(item.endDate).format(SitenameTimeFormat) : '-'}
	</div>
{/snippet}

<Filter bind:variables bind:forceReExecuteGraphqlQuery />

<GraphqlPaginableTable
	query={VOUCHER_LIST_QUERY}
	columns={VOUCHER_COLUMNS}
	resultKey="vouchers"
	bind:variables
	bind:forceReExecuteGraphqlQuery
	class="bg-white rounded-lg border border-gray-200 p-3"
/>
