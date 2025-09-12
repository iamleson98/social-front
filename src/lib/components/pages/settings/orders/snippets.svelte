<script lang="ts" module>
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { ExternalLink, Icon } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/Badge';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import type { OrderLine } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { stringSlicer } from '$lib/utils/utils';

	export const PRODUCT_MODAL_COLUMNS: TableColumnProps<OrderLine, any>[] = [
		{
			title: 'Image',
			child: image,
		},
		{
			title: 'Product',
			child: product,
		},
		{
			title: 'SKU',
			child: sku,
		},
		{
			title: 'Variant',
			child: variant,
		},
		{
			title: 'Quantity',
			child: quantity,
		},
		{
			title: 'Price',
			child: price,
		},
		{
			title: 'Total',
			child: total,
		},
		{
			title: 'Is gift',
			child: isGift,
		},
		{
			title: 'Metadata',
			child: metadata,
		},
		{
			title: 'Actions',
			child: actions,
		},
	];
</script>

{#snippet image({ item }: { item: OrderLine })}
	<Thumbnail src={item?.thumbnail?.url} alt={item?.thumbnail?.alt || item.productName} size="sm" />
{/snippet}

{#snippet actions({ item }: { item: OrderLine })}
	<a
		href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.variant!.product.slug)}
		class="flex justify-center text-blue-600"
		target="_blank"
	>
		<Icon icon={ExternalLink} />
	</a>
{/snippet}

{#snippet product({ item }: { item: OrderLine })}
	<span title={item.productName}>{stringSlicer(item.productName, 60)}</span>
{/snippet}

{#snippet sku({ item }: { item: OrderLine })}
	{item.productSku || '-'}
{/snippet}

{#snippet variant({ item }: { item: OrderLine })}
	{item.variant?.name || '-'}
{/snippet}

{#snippet quantity({ item }: { item: OrderLine })}
	<div class="text-center">{item.quantity}</div>
{/snippet}

{#snippet price({ item }: { item: OrderLine })}
	<PriceDisplay {...item.unitPrice.gross} />
{/snippet}

{#snippet total({ item }: { item: OrderLine })}
	<PriceDisplay {...item.totalPrice.gross} />
{/snippet}

{#snippet isGift({ item }: { item: OrderLine })}
	<div class="text-center">
		<Badge size="xs" color={item.isGift ? 'green' : 'red'} text={item.isGift ? 'yes' : 'no'} />
	</div>
{/snippet}

{#snippet metadata({ item }: { item: OrderLine })}
	<Button
		size="sm"
		color="gray"
		variant="outline"
		onclick={() => (orderLineIDForMetadataView = item.id)}
	>
		View Metadata
	</Button>
{/snippet}
