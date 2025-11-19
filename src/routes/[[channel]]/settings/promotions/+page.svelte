<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PROMOTION_LIST_QUERY } from '$lib/api/admin/discount';
	import Filter from '$lib/components/pages/settings/promotions/filter.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import { PromotionSortField, type Promotion, type QueryPromotionsArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	let variables = $state<QueryPromotionsArgs>({
		first: 10,
	});

	const PROMOTION_COLUMNS: TableColumnProps<Promotion, PromotionSortField>[] = $derived([
		{
			title: $tranFunc('common.name'),
			child: title,
			key: PromotionSortField.Name,
		},
		{
			title: $tranFunc('voucher.discountType'),
			child: discountType,
		},
		{
			title: $tranFunc('common.startAt'),
			child: startDate,
			key: PromotionSortField.StartDate,
		},
		{
			title: $tranFunc('common.endAt'),
			child: endDate,
			key: PromotionSortField.EndDate,
		},
	]);

	let tableRef = $state<GraphqlPaginableTableInterface>();
</script>

{#snippet title({ item }: { item: Promotion })}
	<a href={AppRoute.SETTINGS_CONFIGS_PROMOTION_DETAIL(item.id)} class="link">
		{item.name}
	</a>
{/snippet}

{#snippet discountType({ item }: { item: Promotion })}
	<Badge color="green" text={item.type ? $tranFunc(`promotion.${item.type}`) : '-'} />
{/snippet}

{#snippet startDate({ item }: { item: Promotion })}
	<div class="text-sm font-medium text-gray-600">
		{dayjs(item.startDate).format(SitenameTimeFormat)}
	</div>
{/snippet}

{#snippet endDate({ item }: { item: Promotion })}
	<div class="text-sm font-medium text-gray-600">
		{item.endDate ? dayjs(item.endDate).format(SitenameTimeFormat) : '-'}
	</div>
{/snippet}

<div class="mb-2">
	<Filter bind:variables {tableRef} />
</div>

<GraphqlPaginableTable
	query={PROMOTION_LIST_QUERY}
	columns={PROMOTION_COLUMNS}
	resultKey="promotions"
	bind:variables
	bind:this={tableRef}
/>
