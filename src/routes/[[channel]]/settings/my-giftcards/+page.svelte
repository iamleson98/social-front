<script lang="ts">
	import { MY_GIFTCARDS_QUERY } from '$lib/api/auth';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type { GiftCard, Query, QueryGiftCardsArgs } from '$lib/gql/graphql';

	// const QueryMyGiftcards = operationStore<
	// 	Pick<Query, 'me'>,
	// 	Omit<QueryGiftCardsArgs, 'search' | 'sortBy' | 'filter'>
	// >({
	// 	query: MY_GIFTCARDS_QUERY,
	// 	variables: {
	// 		first: 20,
	// 	},
	// 	requestPolicy: 'cache-and-network',
	// });

	let variables = $state<Omit<QueryGiftCardsArgs, 'search' | 'sortBy' | 'filter'>>({
		first: 20,
	});

	const Columns: TableColumnProps<GiftCard>[] = [
		{
			title: 'Code',
			child: code,
		},
	];
</script>

{#snippet code({ item }: { item: GiftCard })}
	<span>{item.displayCode}</span>
{/snippet}

<!-- {#if $QueryMyGiftcards.fetching}
  <TableSkeleton numColumns={4} numOfRows={1} />
{:else if $QueryMyGiftcards.error}
  <Alert size="sm" variant="error">{$QueryMyGiftcards.error.message}</Alert>
{:else if }
{/if} -->

<div class="flex gap-2">
	<div class="w-2/5">
		<GraphqlPaginableTable
			bind:variables
			query={MY_GIFTCARDS_QUERY}
			resultKey={'me.giftCards' as keyof Query}
			columns={Columns}
		/>
	</div>

	<div class="w-3/5"></div>
</div>
