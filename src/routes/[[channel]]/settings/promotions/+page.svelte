<script lang="ts">
	import { PROMOTION_LIST_QUERY } from '$lib/api/admin/discount';
	import Filter from '$lib/components/pages/settings/config/promotions/filter.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Promotion, QueryPromotionsArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	let variables = $state<QueryPromotionsArgs>({
		first: 10,
		where: {},
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const PROMOTION_COLUMNS: TableColumnProps<Promotion>[] = [
		{
			title: 'Name',
			child: title,
		},
		{
			title: 'Discount type',
			child: discountType,
		},
		{
			title: 'Starts',
			child: startDate,
		},
		{
			title: 'Ends',
			child: endDate,
		},
	];
</script>

{#snippet title({ item }: { item: Promotion })}
	<a href={AppRoute.SETTINGS_CONFIGS_PROMOTION_DETAIL(item.id)} class="link link-hover">
		{item.name}
	</a>
{/snippet}

{#snippet discountType({ item }: { item: Promotion })}
	<Badge
		variant="light"
		color="blue"
		text={item.type?.toLocaleLowerCase()?.split('_').join(' ') || '-'}
	/>
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

<Filter bind:variables bind:forceReExecuteGraphqlQuery />

<GraphqlPaginableTable
	query={PROMOTION_LIST_QUERY}
	columns={PROMOTION_COLUMNS}
	resultKey="promotions"
	bind:variables
	bind:forceReExecuteGraphqlQuery
/>
