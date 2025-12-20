<script lang="ts">
	import { page } from '$app/state';
	import { T } from '$i18n';
	import { MY_GIFTCARDS_QUERY } from '$lib/api/auth';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type { GiftCard, Query, QueryGiftCardsArgs } from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	let variables = $state<Omit<QueryGiftCardsArgs, 'search' | 'sortBy' | 'filter'>>({
		first: 20,
	});

	const Columns: TableColumnProps<GiftCard>[] = $derived([
		{
			title: $T('common.code'),
			child: { render: ({ item }) => item.code },
		},
		{
			title: $T('giftcard.expiryDate'),
			child: {
				render: ({ item }) =>
					item.expiryDate ? dayjs(item.expiryDate).format(SitenameTimeFormat) : '-',
			},
		},
		{
			title: $T('staff.active'),
			child: isActive,
		},
	]);
</script>

{#snippet isActive({ item }: { item: GiftCard })}
	<Badge text={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'green' : 'red'} />
{/snippet}

<HeadBar
	listingPageLabel={$T('customer.giftcards')}
	listingPageHref={page.url.pathname}
	detailRouteID=""
	detailPageLabelGetter={(page) => page.params.id}
/>

<div class="flex gap-2">
	<div class="w-1/2">
		<GraphqlPaginableTable
			bind:variables
			query={MY_GIFTCARDS_QUERY}
			resultKey={'me.giftCards' as keyof Query}
			columns={Columns}
			autoFetchDataOnMount
			autoRefetchOnPaginationParamsChange
		/>
	</div>

	<div class="w-1/2"></div>
</div>
