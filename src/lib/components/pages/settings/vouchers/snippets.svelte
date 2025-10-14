<script lang="ts" module>
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import type { Category, Collection, Product, ProductVariant } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { stringSlicer } from '$lib/utils/utils';

	/**
	 * NOTE: Svelte v5.25.7 does not support store subscription inside <script module> blocks:
	 * https://svelte.dev/e/store_invalid_subscription
	 *
	 * TODO: If this is supported now, please refactor my code. Thank you.
	 */

	/** please provide arguments under form of `$tranFunc(...)` */
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
			child: collectionProducts,
		},
	];

	/** please provide arguments under form of `$tranFunc(...)` */
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
			child: productType,
		},
		{
			title: availabilityTitle,
			child: availability,
		},
	];

	/** please provide arguments under form of `$tranFunc(...)` */
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
			child: categoryNoOfProducts,
		},
	];

	/** please provide arguments under form of `$tranFunc(...)` */
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
{#snippet prdName({ item }: { item: Product })}
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)} class="link" target="_blank">
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
	<a href={AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(item.id)} class="link" target="_blank">
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
	<a href={AppRoute.SETTINGS_CONFIGS_CATEGORY_DETAILS(item.id)} class="link" target="_blank">
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
	<a href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.product.slug)} class="link" target="_blank">
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
