<script lang="ts">
	import { CHECKOUT_ADD_PROMO_CODE_MUTATION } from '$lib/api/checkout';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Button } from '$lib/components/ui';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { Input } from '$lib/components/ui/Input';
	import type {
		Checkout,
		CheckoutLine,
		Money,
		Mutation,
		MutationCheckoutAddPromoCodeArgs,
		OrderLine,
	} from '$lib/gql/graphql';
	import { T } from '$lib/i18n';
	import { checkoutStore } from '$lib/stores/app';
	import { defaultSlideShowState } from '$lib/stores/ui/slideshow';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { formatMoney } from '$lib/utils/utils';
	import MoneyComponent from './money.svelte';
	import SummaryPromocodeRow from './summary-promocode-row.svelte';
	import {
		getSummaryLineProps,
		PRODUCT_NAME_MAX_LENGTH,
		useSummaryLineLineAttributesText,
	} from './utils';
	import { toast } from 'svelte-sonner';

	interface Props {
		editable?: boolean;
		checkout: Checkout;
		/** called after a promo code has been added/removed so the parent can refresh totals */
		onCheckoutUpdated?: () => void;
	}

	const { editable = false, checkout, onCheckoutUpdated }: Props = $props();

	let discountCode = $state('');
	let applyingCode = $state(false);

	/** add a voucher / gift card code to the checkout and refresh the summary */
	const handleApplyPromoCode = async (): Promise<void> => {
		const promoCode = discountCode.trim();
		if (!promoCode || applyingCode) {
			return;
		}

		applyingCode = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutAddPromoCode'>,
			MutationCheckoutAddPromoCodeArgs
		>(CHECKOUT_ADD_PROMO_CODE_MUTATION, { id: checkout.id, promoCode });

		applyingCode = false;

		if (
			checkIfGraphqlResultHasError(result, 'checkoutAddPromoCode') ||
			result.data?.checkoutAddPromoCode?.errors?.length
		) {
			toast.error(
				result.data?.checkoutAddPromoCode?.errors?.[0]?.message || $T('cart.codeInvalid'),
			);
			return;
		}

		const updatedCheckout = result.data?.checkoutAddPromoCode?.checkout as Checkout | null;
		if (updatedCheckout) {
			checkoutStore.set(updatedCheckout);
		}
		discountCode = '';
		toast.success($T('cart.codeApplied'));
		onCheckoutUpdated?.();
	};
</script>

{#snippet lineSummary(line: CheckoutLine | OrderLine)}
	{@const { productImage, productName } = getSummaryLineProps(line)}
	<div class="flex border-b py-1 last:border-none">
		<div
			class="aspect-square h-24 max-tablet:w-16 w-24 max-tablet:h-16 rounded-sm border overflow-hidden bg-white"
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
		<p class="text-xs">{$T('product.quantity')}*</p>
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
		<p>{$T('product.quantity')}: <span class="font-bold">{line.quantity}</span></p>
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
			class={{ 'text-red-600!': onSale }}
		/>
	</div>
{/snippet}

<div class="w-1/2 max-tablet:w-full">
	<div class="bg-white rounded-lg border p-4">
		<AccordionList header={$T('checkout.summary')} items={checkout.lines} child={lineSummary} />

		<!-- discount code -->
		{#if editable}
			<div class="flex items-center gap-2 justify-end border-t py-4">
				<Input
					size="sm"
					class="bg-white!"
					placeholder={$T('checkout.addCodePlaceholder')}
					bind:value={discountCode}
					onkeydown={(evt) => evt.key === 'Enter' && handleApplyPromoCode()}
				/>
				<Button
					size="sm"
					variant="filled"
					disabled={!discountCode.trim() || applyingCode}
					onclick={handleApplyPromoCode}>{$T('btn.apply')}</Button
				>
			</div>
		{/if}

		<!-- price -->
		<div class="flex items-center justify-between">
			<div>{$T('payment.subtotal')}</div>
			<MoneyComponent ariaLabel="subtotal price" money={checkout.subtotalPrice.gross} />
		</div>

		{#if checkout.voucherCode}
			<SummaryPromocodeRow
				{editable}
				promoCode={checkout.voucherCode}
				money={checkout.discount}
				negative
				ariaLabel={$T('checkout.voucher')}
				label={$T('checkout.voucherCodeLabel', { code: checkout.voucherCode })}
				checkoutId={checkout.id}
				{onCheckoutUpdated}
			/>
		{/if}

		{#each checkout.giftCards as giftcard, idx (idx)}
			<SummaryPromocodeRow
				{editable}
				promoCodeId={giftcard.id}
				ariaLabel={$T('checkout.giftCard')}
				label={$T('checkout.giftCardLabel', { code: giftcard.displayCode })}
				money={giftcard.currentBalance}
				negative
				checkoutId={checkout.id}
				{onCheckoutUpdated}
			/>
		{/each}

		<div class="flex items-center justify-between">
			<div>{$T('checkout.shippingCost')}</div>
			<MoneyComponent ariaLabel="shipping cost" money={checkout.shippingPrice.gross} />
		</div>

		<div class="flex flex-row items-baseline justify-between pb-4">
			<div class="flex flex-row items-baseline">
				<p class="font-bold">{$T('checkout.totalPrice')}</p>
				<p class="ml-2 font-black">
					{$T('checkout.includesTax', {
						amount: formatMoney(checkout.totalPrice.tax.currency, checkout.totalPrice.tax.amount),
					})}
				</p>
			</div>
			<MoneyComponent ariaLabel="total price" money={checkout.totalPrice.gross} />
		</div>
	</div>
</div>
