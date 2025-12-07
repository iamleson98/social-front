<script lang="ts">
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Dots, ExternalLink, PencilMinus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { Sticky } from '$lib/components/ui/Popover';
	import type { TableCellProps, TableColumnProps } from '$lib/components/ui/Table';
	import Table from '$lib/components/ui/Table/table.svelte';
	import {
		DiscountValueTypeEnum,
		OrderStatus,
		type Order,
		type OrderDiscountCommonInput,
		type OrderLine,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { stringSlicer } from '$lib/utils/utils';
	import DiscountPopup from './discount-popup.svelte';
	import OrderLineMetadataModal from './order-line-metadata-modal.svelte';
	import { OrderUtilsInstance } from './utils.svelte';

	type Props = {
		orderLines: OrderLine[];
		order: Order;
		/** draft orders can add line discounts, other orders CAN'T */
		allowAddDiscountToLines?: boolean;
	};

	let { orderLines, order, allowAddDiscountToLines }: Props = $props();

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<OrderLine, any>[] = $derived([
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
			child: {render: ({item}) => item.variantName || '-'},
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
	]);

	let metadataModelRef = $state<ReturnType<typeof OrderLineMetadataModal>>();
	let discountItemsRef = $state<HTMLButtonElement[]>([]);

	let targetButtonForItemDiscount = $state<HTMLButtonElement>();
	let existingDiscountOfLine = $state<OrderDiscountCommonInput>();
	let activeOrderLineId = $state<string>();

	/**
	 * sets target for the discount box to attach
	 * sets active order line id
	 * if the order line has discount, set existing discount. Otherwise set existing discount to undefined
	 */
	const handleOpenDiscountModalForOrderLine = async (index: number) => {
		targetButtonForItemDiscount = discountItemsRef[index];
		activeOrderLineId = orderLines[index].id;

		if (orderLines[index] && orderLines[index].unitDiscountValue) {
			existingDiscountOfLine = {
				value: orderLines[index].unitDiscountValue,
				valueType: orderLines[index].unitDiscountType || DiscountValueTypeEnum.Percentage,
				reason: orderLines[index].unitDiscountReason,
			};
		} else existingDiscountOfLine = undefined;
	};
</script>

{#snippet image({ item }: TableCellProps<OrderLine>)}
	<Thumbnail src={item?.thumbnail?.url} alt={item?.thumbnail?.alt || item.productName} size="sm" />
{/snippet}

{#snippet actions({ item }: TableCellProps<OrderLine>)}
	<div class="text-center">
		{#if item.variant}
			<DropDown placement="left">
				{#snippet trigger({ onclick })}
					<IconButton size="xs" icon={Dots} {onclick} variant="light" color="gray" />
				{/snippet}

				<MenuItem
					startIcon={ExternalLink}
					href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.variant.product.slug)}
					class="text-blue-500"
				>
					View product
				</MenuItem>
				{#if order.status === OrderStatus.Draft}
					<MenuItem startIcon={Trash} onclick={() => {}} class="text-red-500">Remove</MenuItem>
				{/if}
			</DropDown>
		{/if}
	</div>
{/snippet}

{#snippet product({ item }: TableCellProps<OrderLine>)}
	<span title={item.productName}>{stringSlicer(item.productName, 35)}</span>
{/snippet}

{#snippet sku({ item }: TableCellProps<OrderLine>)}
	{#if item.variant}
		{item.productSku || '-'}
	{:else}
		<Badge size="xs" color="orange" class="whitespace-nowrap" variant="outline" text="Variant no exist" />
	{/if}
{/snippet}


{#snippet quantity({ item }: TableCellProps<OrderLine>)}
	<div class="text-center">{item.quantity}</div>
{/snippet}

{#snippet price({ item, idx }: TableCellProps<OrderLine>)}
	<div class="space-y-1.5">
		{#if item.undiscountedUnitPrice.gross.amount !== item.unitPrice.gross.amount}
			<PriceDisplay {...item.undiscountedUnitPrice.gross} class="line-through" />
		{/if}
		<PriceDisplay {...item.unitPrice.gross} />
		{#if allowAddDiscountToLines && item.variant}
			<Button
				size="xs"
				variant="light"
				bind:ref={discountItemsRef[idx]}
				onclick={() => handleOpenDiscountModalForOrderLine(idx)}
				endIcon={PencilMinus}
			>
				Add discount
			</Button>
		{/if}
	</div>
{/snippet}

{#snippet total({ item }: TableCellProps<OrderLine>)}
	<PriceDisplay {...item.totalPrice.gross} />
{/snippet}

{#snippet isGift({ item }: TableCellProps<OrderLine>)}
	<div class="text-center">
		<Badge size="xs" color={item.isGift ? 'green' : 'red'} text={item.isGift ? 'yes' : 'no'} />
	</div>
{/snippet}

{#snippet metadata({ item }: TableCellProps<OrderLine>)}
	<Button
		size="xs"
		variant="outline"
		color="gray"
		disabled={!item.variant}
		onclick={() => metadataModelRef?.performFetchingMetadata(item.id)}
	>
		View Metadata
	</Button>
{/snippet}

<div class="overflow-x-auto! overflow-y-visible!">
	<Table columns={PRODUCT_MODAL_COLUMNS} items={orderLines} />
</div>

<OrderLineMetadataModal orderId={order.id} bind:this={metadataModelRef} />

{#if allowAddDiscountToLines}
	<Sticky placement="bottom-start" bind:target={targetButtonForItemDiscount}>
		<!-- NOTE: using #key here so DiscountPopup would re-init when value of existingDiscountOfLine change -->
		{#key existingDiscountOfLine}
			<DiscountPopup
				{order}
				existingDiscount={existingDiscountOfLine}
				onOk={async (discount) => {
					const ok = await OrderUtilsInstance.orderLineDiscountUpdate(activeOrderLineId!, discount);
					// if (ok) onRefetchOrder?.();
				}}
			/>
		{/key}
	</Sticky>
{/if}
