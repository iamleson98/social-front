<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { Input } from '$lib/components/ui/Input';
	import type { Checkout, CheckoutLine, Money, OrderLine } from '$lib/gql/graphql';
	import { defaultSlideShowState } from '$lib/stores/ui/slideshow';
	import { classNames, formatMoney } from '$lib/utils/utils';
	import MoneyComponent from './money.svelte';
	import SummaryPromocodeRow from './summary-promocode-row.svelte';
	import {
		getSummaryLineProps,
		PRODUCT_NAME_MAX_LENGTH,
		useSummaryLineLineAttributesText,
	} from './utils';

	type Props = {
		editable?: boolean;
		checkout: Checkout;
	};

	let { editable = false, checkout }: Props = $props();

	let discountCode = $state('');
</script>

{#snippet lineSummary(line: CheckoutLine | OrderLine)}
	{@const { productImage, productName } = getSummaryLineProps(line)}
	<div class="flex border-b py-1 last:border-none">
		<div
			class="aspect-square h-24 tablet:w-16 w-24 tablet:h-16 rounded-sm border overflow-hidden bg-white"
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
		<Input
			size="xs"
			class="text-center max-w-20 bg-white!"
			type="number"
			bind:value={line.quantity}
		/>
		{@render SummaryMoneyInfo(line)}
	</div>
{/snippet}

{#snippet checkoutLine(line: CheckoutLine | OrderLine)}
	<div class="flex flex-col items-end">
		<p>quantity: <span class="font-bold">{line.quantity}</span></p>
		{@render SummaryMoneyInfo(line)}
	</div>
{/snippet}

{#snippet SummaryMoneyInfo(line: CheckoutLine | OrderLine)}
	{@const onSale = (line.undiscountedUnitPrice as Money).amount !== line.unitPrice.gross.amount}
	<div class="flex flex-row gap-2 text-sm font-semibold">
		{#if onSale}
			<MoneyComponent
				ariaLabel="undiscounted price"
				money={{
					currency: line.undiscountedUnitPrice.currency,
					amount: (line.undiscountedUnitPrice as Money).amount * line.quantity,
				}}
				class="line-through text-gray-500"
			/>
		{/if}
		<MoneyComponent
			ariaLabel="total price"
			money={{
				currency: line.unitPrice.gross.currency,
				amount: line.unitPrice.gross.amount * line.quantity,
			}}
			class={classNames({ 'text-red-600!': onSale })}
		/>
	</div>
{/snippet}

<div class="w-1/2 tablet:w-full">
	<div class="bg-white rounded-lg border p-4">
		<AccordionList header="Summary" items={checkout.lines} child={lineSummary} />

		<!-- discount code -->
		{#if editable}
			<div class="flex items-center gap-2 justify-end border-t py-4">
				<Input
					size="sm"
					class="bg-white!"
					placeholder="Add giftcard or discount code"
					bind:value={discountCode}
				/>
				<Button size="sm" variant="filled" disabled={!discountCode.trim()}>Apply</Button>
			</div>
		{/if}

		<!-- price -->
		<div class="flex items-center justify-between">
			<div>Subtotal</div>
			<MoneyComponent ariaLabel="subtotal price" money={checkout.subtotalPrice.gross} />
		</div>

		{#if checkout.voucherCode}
			<SummaryPromocodeRow
				{editable}
				promoCode={checkout.voucherCode}
				money={checkout.discount}
				negative
				ariaLabel="Voucher"
				label={`Voucher code: ${checkout.voucherCode}`}
				checkoutId={checkout.id}
			/>
		{/if}

		{#each checkout.giftCards as giftcard, idx (idx)}
			<SummaryPromocodeRow
				{editable}
				promoCodeId={giftcard.id}
				ariaLabel="Gift card"
				label={`Gift Card: •••• •••• ${giftcard.displayCode}`}
				money={giftcard.currentBalance}
				negative
				checkoutId={checkout.id}
			/>
		{/each}

		<div class="flex items-center justify-between">
			<div>Shipping cost</div>
			<MoneyComponent ariaLabel="shipping cost" money={checkout.shippingPrice.gross} />
		</div>

		<div class="flex flex-row items-baseline justify-between pb-4">
			<div class="flex flex-row items-baseline">
				<p class="font-bold">Total price</p>
				<p class="ml-2 font-black">
					includes {formatMoney(
						checkout.totalPrice.tax.currency as string,
						checkout.totalPrice.tax.amount as number,
					)} tax
				</p>
			</div>
			<MoneyComponent ariaLabel="total price" money={checkout.totalPrice.gross} />
		</div>
	</div>
</div>
