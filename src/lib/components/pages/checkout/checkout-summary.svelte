<script lang="ts">
	import { Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Accordion, AccordionList } from '$lib/components/ui/Accordion';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import type { Checkout, CheckoutLine, Money, OrderLine } from '$lib/gql/graphql';
	import { defaultState as defaultSlideShowState } from '$lib/stores/ui/slideshow';
	import { classNames, formatMoney } from '$lib/utils/utils';
	import {
		getSummaryLineProps,
		PRODUCT_NAME_MAX_LENGTH,
		useSummaryLineLineAttributesText
	} from './utils';

	type Props = {
		checkout: Checkout;
		editable?: boolean;
	};

	let { checkout, editable = true }: Props = $props();

	let discountCode = $state('');
</script>

<!-- checkout summary form -->

{#snippet lineSummary(line: CheckoutLine | OrderLine)}
	{@const { productImage, productName } = getSummaryLineProps(line)}
	<div class="flex border-b py-1 last:border-none">
		<div
			class="aspect-square h-24 tablet:w-16 w-24 tablet:h-16 rounded border overflow-hidden bg-white"
		>
			{#if productImage}
				<img
					src={productImage.url}
					alt={productImage.alt ?? ''}
					class="object-contain object-center"
				/>
			{:else}
				<img src={defaultSlideShowState.medias[0].url} alt={defaultSlideShowState.medias[0].alt} />
			{/if}
		</div>
		<div class="flex justify-between flex-1 justify-items-start gap-4 pl-2">
			<div class="flex flex-col gap-y-1.5">
				<p title={productName} class="font-bold">
					{productName.length > PRODUCT_NAME_MAX_LENGTH
						? `${productName.slice(0, PRODUCT_NAME_MAX_LENGTH)}...`
						: productName}
				</p>
				<p class="text-xs text-neutral-500">{useSummaryLineLineAttributesText(line)}</p>
			</div>

			{#if editable}
				{@render checkoutLineEditable(line)}
			{:else}
				{@render checkoutLine(line)}
			{/if}
		</div>
	</div>
{/snippet}

{#snippet checkoutLineEditable(line: CheckoutLine | OrderLine)}
	<div class="flex flex-col items-end gap-1.5">
		<p class="text-xs">quantity*</p>
		<Input size="sm" class="text-center max-w-20" type="number" bind:value={line.quantity} />
		{@render SummaryMoneyInfo(line)}
	</div>
{/snippet}

{#snippet checkoutLine(line: CheckoutLine | OrderLine)}
	<div class="flex flex-col items-end">
		<p>Qty: {line.quantity}</p>
		{@render SummaryMoneyInfo(line)}
	</div>
{/snippet}

{#snippet SummaryMoneyInfo(line: CheckoutLine | OrderLine)}
	{@const onSale = (line.undiscountedUnitPrice as Money).amount !== line.unitPrice.gross.amount}
	<div class="flex flex-row gap-2">
		{#if onSale}
			<!-- on sale -->
			{@render money(
				line.undiscountedUnitPrice.currency,
				(line.undiscountedUnitPrice as Money).amount * line.quantity,
				'line-through'
			)}
		{/if}
		{@render money(
			line.unitPrice.gross.currency,
			(line.unitPrice.gross.amount || 0) * line.quantity,
			classNames({ '!text-red-700': onSale })
		)}
	</div>
{/snippet}

{#snippet money(currency: string, amount: number, classes: string = '', negative: boolean = false)}
	<p class={`${classes} font-semibold text-xs`}>
		{formatMoney(currency, negative ? -amount : amount)}
	</p>
{/snippet}

<div class="w-1/2 tablet:w-full">
	<AccordionList header="Summary" items={checkout.lines} child={lineSummary} />

	<!-- discount code -->
	{#if editable}
		<div class="flex items-center gap-2 justify-end border-t py-2">
			<Input size="sm" placeholder="Add giftcard or discount code" bind:value={discountCode} />
			<Button size="sm" variant="filled" disabled={!discountCode.trim()}>Apply</Button>
		</div>
	{/if}

	<!-- price -->
	<div class="flex items-center justify-between">
		<div>Subtotal</div>
		{@render money(checkout.subtotalPrice.gross.currency, checkout.subtotalPrice.gross.amount)}
	</div>

	{#if checkout.voucherCode}
		<div class="flex items-center justify-between">
			<div>Voucher code: {checkout.voucherCode}</div>
			<IconButton
				icon={Trash}
				size="sm"
				aria-label="Remove promo code"
				variant="light"
				color="red"
			/>
		</div>
	{/if}

	{#each checkout.giftCards as gc, idx (idx)}
		<div class="flex items-center justify-between">
			<div>Gift Card: •••• •••• ${gc.displayCode}</div>
			{@render money(gc.currentBalance.currency, gc.currentBalance.amount)}
		</div>
	{/each}

	<div class="flex items-center justify-between">
		<div>Shipping cost</div>
		{@render money(checkout.shippingPrice.gross.currency, checkout.shippingPrice.gross.amount)}
	</div>
</div>
