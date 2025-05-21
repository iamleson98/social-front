<script lang="ts">
	import { GIFTCARD_LIST_QUERY } from '$lib/api/admin/discount';
	import { Search } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/config/giftcards/filter.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { GiftCardSortField, type GiftCard, type QueryGiftCardsArgs } from '$lib/gql/graphql';
	import dayjs from 'dayjs';

	let forceReExecuteGraphqlQuery = $state(true);
	let variables = $state<QueryGiftCardsArgs>({ first: 10 });

	const COLUMNS: TableColumnProps<GiftCard, GiftCardSortField>[] = [
		{
			title: 'Code',
			child: code,
		},
		{
			title: 'Status',
			child: status,
		},
		{
			title: 'Issued at',
			sortable: true,
			key: GiftCardSortField.CreatedAt,
			child: issueAt,
		},
	];
</script>

{#snippet code({ item }: { item: GiftCard })}
	<span>{item.displayCode}</span>
{/snippet}

{#snippet issueAt({ item }: { item: GiftCard })}
	<span>{dayjs(item.created).format('DD/MM/YYYY HH:mm')}</span>
{/snippet}

{#snippet status({ item }: { item: GiftCard })}
	<Badge
		text={item.isActive ? 'Active' : 'Disabled'}
		size="sm"
		variant="filled"
		color={item.isActive ? 'green' : 'red'}
	/>
{/snippet}

<div class="flex items-center gap-2 mb-2">
	<Filter />
	<Input placeholder="Enter query" size="sm" startIcon={Search} />
</div>

<GraphqlPaginableTable
	query={GIFTCARD_LIST_QUERY}
	bind:forceReExecuteGraphqlQuery
	resultKey="giftCards"
	bind:variables
	columns={COLUMNS}
/>
