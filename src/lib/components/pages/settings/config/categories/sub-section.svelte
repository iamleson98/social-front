<script lang="ts">
	import { CATEGORY_CHILDREN_LIST_QUERY } from '$lib/api/admin/category';
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		type Category,
		type Product,
		type Query,
		type QueryCategoriesArgs,
		type QueryProductsArgs,
	} from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	type Props = {
		categoryId: string;
	};

	let { categoryId }: Props = $props();

	let forceReExecuteGraphqlQuery = $state(true);

	const CATEGORY_CHILDREN_COLUMNS: TableColumnProps<Category, any>[] = [
		{
			title: 'Name',
			child: categoryName,
		},
		{
			title: 'No. of products',
			child: noOfProducts,
		},
		{
			title: 'Subcategories',
			child: childCount,
		},
	];

	const PRODUCTS_COLUMNS: TableColumnProps<Product, any>[] = [
		{
			title: 'Image',
			child: image,
		},
		{
			title: 'Name',
			child: productName,
		},
		{
			title: 'Updated at',
			child: productUpdatedAt,
		},
	];
</script>

{#snippet categoryName({ item }: { item: Category })}
	<span>{item.name}</span>
{/snippet}

{#snippet noOfProducts({ item }: { item: Category })}
	<span class="text-center">{item.products?.totalCount}</span>
{/snippet}

{#snippet childCount({ item }: { item: Category })}
	<span>{item.children?.totalCount}</span>
{/snippet}

{#snippet image({ item }: { item: Product })}
	<div class="text-center">
		<Thumbnail size="sm" src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} />
	</div>
{/snippet}

{#snippet productName({ item }: { item: Product })}
	<span>{item.name}</span>
{/snippet}

{#snippet productUpdatedAt({ item }: { item: Product })}
	<span class="text-xs">{dayjs(item.updatedAt).format(SitenameTimeFormat)}</span>
{/snippet}

<div>
	<SectionHeader>Sub categories</SectionHeader>
	<GraphqlPaginableTable
		query={CATEGORY_CHILDREN_LIST_QUERY}
		resultKey={'category.children' as keyof Query}
		variables={{ first: 10, id: categoryId } as QueryCategoriesArgs}
		bind:forceReExecuteGraphqlQuery
		columns={CATEGORY_CHILDREN_COLUMNS}
	/>
</div>

<div class="mt-2">
	<SectionHeader>Products</SectionHeader>
	<GraphqlPaginableTable
		query={PRODUCT_LIST_QUERY_ADMIN}
		resultKey={'products' as keyof Query}
		variables={{ first: 10, filter: { categories: [categoryId] } } as QueryProductsArgs}
		bind:forceReExecuteGraphqlQuery
		columns={PRODUCTS_COLUMNS}
	/>
</div>
