<script lang="ts">
	import { tranFunc } from '$i18n';
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
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	type Props = {
		categoryId: string;
	};

	let { categoryId }: Props = $props();

	let forceReExecuteGraphqlQuery = $state(true);

	const CATEGORY_CHILDREN_COLUMNS: TableColumnProps<Category, any>[] = $derived([
		{
			title: $tranFunc('common.name'),
			child: categoryName,
		},
		{
			title: $tranFunc('collection.noOfPrds'),
			child: noOfProducts,
		},
		{
			title: $tranFunc('product.subCategories'),
			child: childCount,
		},
	]);

	const PRODUCTS_COLUMNS: TableColumnProps<Product, any>[] = $derived([
		{
			title: $tranFunc('common.pic'),
			child: image,
		},
		{
			title: $tranFunc('common.name'),
			child: productName,
		},
		{
			title: $tranFunc('common.editAt'),
			child: productUpdatedAt,
		},
	]);
</script>

{#snippet categoryName({ item }: { item: Category })}
	<a class="link" href={AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(item.id)}>
		{item.name}
	</a>
{/snippet}

{#snippet noOfProducts({ item }: { item: Category })}
	<div class="text-center"><span>{item.products?.totalCount}</span></div>
{/snippet}

{#snippet childCount({ item }: { item: Category })}
	<div class="text-center">
		<span>{item.children?.totalCount}</span>
	</div>
{/snippet}

{#snippet image({ item }: { item: Product })}
	<div class="text-center">
		<Thumbnail size="sm" src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} />
	</div>
{/snippet}

{#snippet productName({ item }: { item: Product })}
	<a class="link" href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)}>{item.name}</a>
{/snippet}

{#snippet productUpdatedAt({ item }: { item: Product })}
	<span class="text-xs">{dayjs(item.updatedAt).format(SitenameTimeFormat)}</span>
{/snippet}

<div class="space-y-2 w-4/10 tablet:w-full">
	<div class={[SitenameCommonClassName]}>
		<SectionHeader>{$tranFunc('product.subCategories')}</SectionHeader>
		<div class="overflow-x-auto">
			<GraphqlPaginableTable
				query={CATEGORY_CHILDREN_LIST_QUERY}
				resultKey={'category.children' as keyof Query}
				variables={{ first: 10, id: categoryId } as QueryCategoriesArgs}
				bind:forceReExecuteGraphqlQuery
				columns={CATEGORY_CHILDREN_COLUMNS}
			/>
		</div>
	</div>

	<div class={[SitenameCommonClassName]}>
		<SectionHeader>{$tranFunc('product.products')}</SectionHeader>
		<div class="overflow-x-auto">
			<GraphqlPaginableTable
				query={PRODUCT_LIST_QUERY_ADMIN}
				resultKey={'products' as keyof Query}
				variables={{ first: 10, filter: { categories: [categoryId] } } as QueryProductsArgs}
				bind:forceReExecuteGraphqlQuery
				columns={PRODUCTS_COLUMNS}
			/>
		</div>
	</div>
</div>
