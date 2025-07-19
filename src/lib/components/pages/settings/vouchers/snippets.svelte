<script lang="ts" module>
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import type { Category, Collection, Product, ProductVariant } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { stringSlicer } from '$lib/utils/utils';

	export const COLLECTION_COLUMNS: TableColumnProps<Collection>[] = [
		{
			title: 'Image',
			child: collectionImage,
		},
		{
			title: 'Name',
			child: name,
		},
		{
			title: 'No. of products',
			child: collectionProducts,
		},
	];

	export const PRODUCT_COLUMNS: TableColumnProps<Product>[] = [
		{
			title: 'Image',
			child: prdImage,
		},
		{
			title: 'Name',
			child: prdName,
		},
		{
			title: 'Product type',
			child: productType,
		},
		{
			title: 'Availability',
			child: availability,
		},
	];

	export const CATEGORY_COLUMNS: TableColumnProps<Category>[] = [
		{
			title: 'Image',
			child: categoryImage,
		},
		{
			title: 'Name',
			child: categoryName,
		},
		{
			title: 'No. of products',
			child: categoryNoOfProducts,
		},
	];

	export const VARIANT_COLUMNS: TableColumnProps<ProductVariant>[] = [
		{
			title: 'Image',
			child: variantImage,
		},
		{
			title: 'Product name',
			child: variantPrdName,
		},
		{
			title: 'Variant name',
			child: variantName,
		},
	];
</script>

<!-- Product -->
{#snippet prdName({ item }: { item: Product })}
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)} class="link">
		{stringSlicer(item.name, 40)}
	</a>
{/snippet}

{#snippet prdImage({ item }: { item: Product })}
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} size="sm" />
{/snippet}

{#snippet collectionImage({ item }: { item: Collection })}
	<Thumbnail
		src={item.backgroundImage?.url}
		alt={item.backgroundImage?.alt || item.name}
		size="sm"
	/>
{/snippet}

{#snippet productType({ item }: { item: Product })}
	<span>{item.productType?.name}</span>
{/snippet}

<!-- Collection -->
{#snippet name({ item }: { item: Collection })}
	<a href={AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(item.id)} class="link">
		{item.name}
	</a>
{/snippet}

{#snippet collectionProducts({ item }: { item: Collection })}
	<span>{item.products?.totalCount || '-'}</span>
{/snippet}

{#snippet availability({ item }: { item: Product })}
	<Badge
		text={`${item.channelListings?.length} channels`}
		color={item.channelListings?.length ? 'green' : 'red'}
		class="tooltip tooltip-top"
		data-tip={item.channelListings?.map((item) => item.channel.name).join(', ') || 'No channels'}
	/>
{/snippet}

<!-- Category -->
{#snippet categoryName({ item }: { item: Category })}
	<a href={AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(item.id)} class="link">
		{item.name}
	</a>
{/snippet}

{#snippet categoryNoOfProducts({ item }: { item: Category })}
	<span>{item.products?.totalCount || '-'}</span>
{/snippet}

{#snippet categoryImage({ item }: { item: Category })}
	<Thumbnail
		src={item.backgroundImage?.url}
		alt={item.backgroundImage?.alt || item.name}
		size="sm"
	/>
{/snippet}

<!-- Variant -->
{#snippet variantPrdName({ item }: { item: ProductVariant })}
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.product.slug)} class="link">
		{stringSlicer(item.product.name, 40)}
	</a>
{/snippet}

{#snippet variantImage({ item }: { item: ProductVariant })}
	<Thumbnail
		src={item.product.thumbnail?.url}
		alt={item.product.thumbnail?.alt || item.product.name}
		size="sm"
	/>
{/snippet}

{#snippet variantName({ item }: { item: ProductVariant })}
	<span>{item.name}</span>
{/snippet}
