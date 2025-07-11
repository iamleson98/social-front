<script lang="ts">
	import { tranFunc } from '$i18n';
	import { CATEGORIES_LIST_QUERY } from '$lib/api/admin/category';
	import FilterManager from '$lib/components/common/filter-box/filter-manager.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import GraphqlPaginableTable from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import { CategorySortField, type Category, type QueryCategoriesArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	const COLUMNS: TableColumnProps<Category, CategorySortField>[] = $derived([
		{
			title: $tranFunc('common.pic'),
			child: picture,
		},
		{
			title: $tranFunc('common.name'),
			child: name,
			sortable: true,
			key: CategorySortField.Name,
		},
		{
			title: $tranFunc('collection.noOfPrds'),
			child: products,
			sortable: true,
			key: CategorySortField.ProductCount,
		},
		{
			title: $tranFunc('category.noOfChildren'),
			child: children,
			sortable: true,
			key: CategorySortField.SubcategoryCount,
		},
		{
			title: $tranFunc('common.editAt'),
			child: updatedAt,
		},
	]);

	let forceReExecuteGraphqlQuery = $state(true);
	let queryVariables = $state<QueryCategoriesArgs>({
		first: 10,
		level: 0,
		filter: {
			search: '',
		},
	});
</script>

{#snippet picture({ item }: { item: Category })}
	<Thumbnail
		src={item.backgroundImage?.url}
		alt={item.backgroundImage?.alt || item.name}
		size="sm"
	/>
{/snippet}

{#snippet name({ item }: { item: Category })}
	<a class="link" href={AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(item.id)}>{item.name}</a>
{/snippet}

{#snippet products({ item }: { item: Category })}
	<div class="text-center">{item.products?.totalCount}</div>
{/snippet}

{#snippet children({ item }: { item: Category })}
	<div class="text-center">{item.children?.totalCount}</div>
{/snippet}

{#snippet updatedAt({ item }: { item: Category })}
	<div>{dayjs(item.updatedAt).format(SitenameTimeFormat)}</div>
{/snippet}

<FilterManager
	searchKey={'filter.search' as keyof QueryCategoriesArgs}
	bind:variables={queryVariables}
	bind:forceReExecuteGraphqlQuery
/>

<GraphqlPaginableTable
	query={CATEGORIES_LIST_QUERY}
	columns={COLUMNS}
	bind:variables={queryVariables}
	resultKey="categories"
	bind:forceReExecuteGraphqlQuery
	autoRefetchOnVariableChange={false}
/>
