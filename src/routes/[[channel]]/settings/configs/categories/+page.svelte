<script lang="ts">
	import { CATEGORIES_LIST_QUERY } from '$lib/api/admin/category';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import GraphqlPaginableTable from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import { CategorySortField, type Category, type QueryCategoriesArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	const COLUMNS: TableColumnProps<Category, CategorySortField>[] = [
		{
			title: 'Pic',
			child: picture
		},
		{
			title: 'Name',
			child: name,
			sortable: true,
			key: CategorySortField.Name
		},
		{
			title: 'Number of products',
			child: products,
			sortable: true,
			key: CategorySortField.ProductCount
		},
		{
			title: 'Number of children',
			child: children,
			sortable: true,
			key: CategorySortField.SubcategoryCount
		}
	];

	let forceReExecuteGraphqlQuery = $state(true);
	let queryVariables = $state<QueryCategoriesArgs>({
		first: 10,
		level: 0
	});
</script>

{#snippet picture({ item }: { item: Category })}
	<div class="rounded-lg border border-gray-200 w-9 h-9 overflow-hidden">
		<img src={item.backgroundImage?.url} alt={item.backgroundImage?.alt} class="w-full h-full" />
	</div>
{/snippet}

{#snippet name({ item }: { item: Category })}
	<a class="link" href={AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(item.id)}>{item.name}</a>
{/snippet}

{#snippet products({ item }: { item: Category })}
	<div>{item.products?.totalCount || '-'}</div>
{/snippet}

{#snippet children({ item }: { item: Category })}
	<div>{item.children?.totalCount || '-'}</div>
{/snippet}

<GraphqlPaginableTable
	query={CATEGORIES_LIST_QUERY}
	columns={COLUMNS}
	bind:variables={queryVariables}
	resultKey="categories"
	bind:forceReExecuteGraphqlQuery
/>
