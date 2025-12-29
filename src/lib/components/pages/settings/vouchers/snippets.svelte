<script lang="ts" module>
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import type { TableCellProps, TableColumnProps } from '$lib/components/ui/Table';
	import type { Category, Collection, Product, ProductVariant } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { stringSlicer } from '$lib/utils/utils';

	/**
	 * NOTE: Svelte v5.25.7 does not support store subscription inside <script module> blocks:
	 * https://svelte.dev/e/store_invalid_subscription
	 *
	 * TODO: If this is supported now, please refactor my code. Thank you.
	 */

	/** please provide arguments under form of `$T(...)` */
	export const COLLECTION_COLUMNS = (
		pictureTitle: string,
		nameTitle: string,
		noOfProductsTitle: string,
	): TableColumnProps<Collection, string>[] => [
		{
			title: pictureTitle,
			child: collectionImage,
		},
		{
			title: nameTitle,
			child: name,
		},
		{
			title: noOfProductsTitle,
			child: { render: ({ item }) => item.products?.totalCount || '-' },
		},
	];

	/** please provide arguments under form of `$T(...)` */
	export const PRODUCT_COLUMNS = (
		pictureTitle: string,
		productNameTitle: string,
		productTypeTitle: string,
		availabilityTitle: string,
	): TableColumnProps<Product, string>[] => [
		{
			title: pictureTitle,
			child: prdImage,
		},
		{
			title: productNameTitle,
			child: prdName,
		},
		{
			title: productTypeTitle,
			child: { render: ({ item }) => item.productType.name || '-' },
		},
		{
			title: availabilityTitle,
			child: availability,
		},
	];

	/** please provide arguments under form of `$T(...)` */
	export const CATEGORY_COLUMNS = (
		categoryImageTitle: string,
		categoryNameTitle: string,
		numberOfProductsTitle: string,
	): TableColumnProps<Category, string>[] => [
		{
			title: categoryImageTitle,
			child: categoryImage,
		},
		{
			title: categoryNameTitle,
			child: categoryName,
		},
		{
			title: numberOfProductsTitle,
			child: { render: ({ item }) => item.products?.totalCount || '-' },
		},
	];

	/** please provide arguments under form of `$T(...)` */
	export const VARIANT_COLUMNS = (
		variantImageTitle: string,
		productNameTitle: string,
		variantNameTitle: string,
	): TableColumnProps<ProductVariant, string>[] => [
		{
			title: variantImageTitle,
			child: variantImage,
		},
		{
			title: productNameTitle,
			child: variantPrdName,
		},
		{
			title: variantNameTitle,
			child: variantName,
		},
	];
</script>

<!-- Product -->
{#snippet prdName({ item }: TableCellProps<Product>)}
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)} class="link" target="_blank">
		{stringSlicer(item.name, 40)}
	</a>
{/snippet}

{#snippet prdImage({ item }: TableCellProps<Product>)}
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} size="sm" />
{/snippet}

{#snippet collectionImage({ item }: TableCellProps<Collection>)}
	<Thumbnail
		src={item.backgroundImage?.url}
		alt={item.backgroundImage?.alt || item.name}
		size="sm"
	/>
{/snippet}

<!-- Collection -->
{#snippet name({ item }: TableCellProps<Collection>)}
	<a href={AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(item.id)} class="link" target="_blank">
		{item.name}
	</a>
{/snippet}

{#snippet availability({ item }: TableCellProps<Product>)}
	<Badge
		text={`${item.channelListings?.length} channels`}
		color={item.channelListings?.length ? 'green' : 'red'}
		class="tooltip tooltip-top"
		data-tip={item.channelListings?.map((item) => item.channel.name).join(', ') || 'No channels'}
	/>
{/snippet}

<!-- Category -->
{#snippet categoryName({ item }: TableCellProps<Category>)}
	<a href={AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(item.id)} class="link" target="_blank">
		{item.name}
	</a>
{/snippet}

{#snippet categoryImage({ item }: TableCellProps<Category>)}
	<Thumbnail
		src={item.backgroundImage?.url}
		alt={item.backgroundImage?.alt || item.name}
		size="sm"
	/>
{/snippet}

<!-- Variant -->
{#snippet variantPrdName({ item }: TableCellProps<ProductVariant>)}
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.product.slug)} class="link" target="_blank">
		{stringSlicer(item.product.name, 40)}
	</a>
{/snippet}

{#snippet variantImage({ item }: TableCellProps<ProductVariant>)}
	<Thumbnail
		src={item.product.thumbnail?.url}
		alt={item.product.thumbnail?.alt || item.product.name}
		size="sm"
	/>
{/snippet}

{#snippet variantName({ item }: TableCellProps<ProductVariant>)}
	<span>{item.name}</span>
{/snippet}
