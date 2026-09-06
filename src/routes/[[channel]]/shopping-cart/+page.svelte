<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { T } from '$i18n';
	import { CHECKOUT_ADD_PROMO_CODE_MUTATION } from '$lib/api/checkout';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { CheckoutSteps } from '$lib/components/common/checkout-steps';
	import { ArrowNarrowRight, ChevronLeft, Icon, Ticket } from '$lib/components/icons';
	import { EmptyCart } from '$lib/components/icons/SvgOuterIcon';
	import CartItemLine from '$lib/components/pages/cart/cart-item-line.svelte';
	import CartPageSkeleton from '$lib/components/pages/cart/cart-page-skeleton.svelte';
	import { Button } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import type { Checkout, Mutation, MutationCheckoutAddPromoCodeArgs } from '$lib/gql/graphql';
	import { checkoutStore } from '$lib/stores/app';
	import { AppRoute } from '$lib/utils';
	import { HTTPStatusSuccess } from '$lib/utils/consts';
	import { checkIfGraphqlResultHasError, formatMoney } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let promoCodeInput = $state('');
	let applyingPromoCode = $state(false);

	/** apply a voucher / gift card code to the current checkout */
	const handleApplyPromoCode = async (): Promise<void> => {
		const promoCode = promoCodeInput.trim();
		if (!promoCode || applyingPromoCode || !$checkoutStore?.id) {
			return;
		}

		applyingPromoCode = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutAddPromoCode'>,
			MutationCheckoutAddPromoCodeArgs
		>(CHECKOUT_ADD_PROMO_CODE_MUTATION, { id: $checkoutStore.id, promoCode });

		applyingPromoCode = false;

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
		promoCodeInput = '';
		toast.success($T('cart.codeApplied'));
	};

	afterNavigate(() => {
		scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	});

	let loading = $state(true);

	onMount(async () => {
		const fetchResult = await fetch(AppRoute.CHECKOUT_GET_OR_CREATE);
		const checkoutData = await fetchResult.json();
		loading = false;

		if (checkoutData.status !== HTTPStatusSuccess) {
			toast.error(checkoutData.message);
			return;
		}

		checkoutStore.set(checkoutData.checkout);
	});

	type MoneyColor = 'red' | 'green' | 'gray' | 'brand';

	const moneyColorMap: Record<MoneyColor, string> = {
		red: 'text-red-600',
		green: 'text-green-700',
		gray: 'text-gray-500 line-through',
		brand: 'text-brand-700',
	};
</script>

{#snippet MoneyField(
	currency: string,
	amount: number,
	title: string,
	color: MoneyColor,
	negative: boolean = false,
)}
	{@const negate = negative ? '-' : ''}
	<dl class="flex items-center justify-between gap-4 mb-1.5" aria-label={title}>
		<dt class="text-sm font-normal text-gray-500">{title}</dt>
		<dd class={`text-base font-semibold tabular-nums ${moneyColorMap[color]}`}>
			{negate}{formatMoney(currency, amount)}
		</dd>
	</dl>
{/snippet}

<div>
	{#if loading}
		<CartPageSkeleton />
	{:else if !$checkoutStore?.lines.length}
		<!-- MARK: EMPTY -->
		<div class="h-full w-full flex items-center justify-center">
			<div class="text-center py-24">
				<div class="flex justify-center">
					<EmptyCart dimension={120} />
				</div>

				<h1 class="mt-6 text-xl font-bold text-gray-900">{$T('cart.emptyCart')}</h1>
				<p class="mt-2 text-sm text-gray-500">{$T('cart.emptyCartHint')}</p>
				<div class="mt-6">
					<Button
						size="md"
						onclick={() => goto(AppRoute.HOME())}
						variant="filled"
						startIcon={ChevronLeft}
					>
						{$T('cart.continueShopping')}
					</Button>
				</div>
			</div>
		</div>
	{:else}
		{@const { lines, id, subtotalPrice } = $checkoutStore}
		{@const originalTotalPrice = lines
			.map((line) => line.undiscountedTotalPrice.amount)
			.reduce((a, b) => a + b, 0)}
		{@const savings = originalTotalPrice - subtotalPrice.gross.amount}

		<CheckoutSteps numberOfItemToEnable={1} />

		<div class="flex flex-row justify-between max-tablet:flex-wrap max-tablet:flex-col gap-4">
			<!-- MARK: PREVIEW AREA -->
			<div class="w-3/4 max-tablet:w-full">
				<h1 class="text-lg font-bold text-gray-900 mb-3">
					{$T('cart.title')}
					<span class="text-sm font-normal text-gray-500">
						({$T('cart.itemsCount', { count: lines.length })})
					</span>
				</h1>
				{#each lines as line, idx (idx)}
					<CartItemLine {line} checkoutId={id} />
				{/each}
			</div>

			<!-- MARK: SUMMARY -->
			<div class="w-1/4 max-tablet:w-full">
				<div class="card-surface p-5 mb-2 sticky top-[100px]">
					<p class="text-lg font-bold text-gray-900 mb-4">{$T('cart.cartSummary')}</p>

					<div class="mb-4">
						{@render MoneyField(
							subtotalPrice.gross.currency,
							originalTotalPrice,
							$T('cart.oldTotalPrice'),
							'gray',
						)}

						{#if savings > 0}
							{@render MoneyField(
								subtotalPrice.gross.currency,
								savings,
								$T('cart.savings'),
								'green',
								true,
							)}
						{/if}

						<div class="border-t border-gray-100 my-2.5"></div>

						{@render MoneyField(
							subtotalPrice.gross.currency,
							subtotalPrice.gross.amount,
							$T('cart.tempoTotalPrice'),
							'red',
						)}
					</div>

					<Button
						variant="filled"
						fullWidth
						size="md"
						endIcon={ArrowNarrowRight}
						onclick={() => goto(`${AppRoute.CHECKOUT()}/${$checkoutStore.id}`)}
					>
						{$T('cart.proceedCheckout')}
					</Button>

					<div class="flex items-center justify-center gap-1 mt-3">
						<span class="text-sm font-normal text-gray-500"> {$T('cart.or')} </span>
						<a
							href="/"
							class="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 underline"
						>
							<span>{$T('cart.continueShopping')}</span>
							<Icon icon={ArrowNarrowRight} class="size-3.5" />
						</a>
					</div>
				</div>

				<!-- coupon -->
				<div class="card-surface p-5">
					<div class="flex items-center gap-2 mb-2">
						<Icon icon={Ticket} class="size-4 text-brand-600" />
						<p class="text-sm font-semibold text-gray-800">{$T('cart.haveVoucherOrGiftcard')}</p>
					</div>
					<Input
						placeholder={$T('cart.enterCode')}
						size="md"
						class="w-full mb-2"
						bind:value={promoCodeInput}
						onkeydown={(evt) => evt.key === 'Enter' && handleApplyPromoCode()}
					/>
					<Button
						variant="outline"
						size="sm"
						fullWidth
						disabled={!promoCodeInput.trim() || applyingPromoCode}
						onclick={handleApplyPromoCode}
					>
						{$T('cart.applyCode')}
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>
