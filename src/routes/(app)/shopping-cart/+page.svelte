<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { tClient } from '$i18n';
	import { ArrowNarrowRight, EmptyDrawer, Icon } from '$lib/components/icons';
	import CartItemLine from '$lib/components/pages/cart/cart-item-line.svelte';
	import { Button } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import type { Query } from '$lib/gql/graphql';
	import { operationStore } from '$lib/stores/api/operation';
	import { CHECKOUT_PREVIEW_QUERY } from '$lib/stores/api/checkout';
	import { AppRoute } from '$lib/utils';
	import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault, getCookieByKey } from '$lib/utils/cookies';
	import type { CustomQueryCheckoutArgs } from '$lib/utils/types';
	import { formatMoney } from '$lib/utils/utils';
	import { CommonTimeLine } from '$lib/components/common/timeline';
	import CartPageSkeleton from '$lib/components/pages/cart/cart-page-skeleton.svelte';

	afterNavigate(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	});

	const handleProceedToCheckout = async () => {
		const checkoutID = getCookieByKey(
			`checkout-${clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug)}`
		);
		await goto(`${AppRoute.CHECKOUT}/${checkoutID}`, { invalidateAll: true });
	};

	const cartPreviewResultStore = operationStore<Pick<Query, 'checkout'>, CustomQueryCheckoutArgs>({
		kind: 'query',
		query: CHECKOUT_PREVIEW_QUERY,
		variables: {
			id: getCookieByKey(
				`checkout-${clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug)}`
			)
		}
	});

	type MoneyColor = 'red' | 'green' | 'gray';

	const moneyColorMap: Record<MoneyColor, string> = {
		red: 'text-red-600',
		green: 'text-green-600',
		gray: 'text-gray-500 line-through'
	};
</script>

{#snippet MoneyField(
	currency: string,
	amount: number,
	title: string,
	color: MoneyColor,
	negative: boolean = false
)}
	{@const negate = negative ? '-' : ''}
	<dl class="flex items-center justify-between gap-4 mb-1.5" aria-label={title}>
		<dt class="text-sm font-normal text-gray-500">{title}</dt>
		<dd class={`text-base font-semibold ${moneyColorMap[color]}`}>
			{negate}{formatMoney(currency, amount)}
		</dd>
	</dl>
{/snippet}

<div>
	{#if $cartPreviewResultStore.fetching}
		<CartPageSkeleton />
	{:else if $cartPreviewResultStore.error}
		<div>{$cartPreviewResultStore.error.message}</div>
	{:else if !$cartPreviewResultStore.data?.checkout?.lines.length}
		<div class="h-full w-full flex items-center justify-center">
			<div class="text-center">
				<div class="text-blue-400 text-center">
					<Icon icon={EmptyDrawer} width="10rem" height="10rem" class="text-center" />
				</div>

				<div>
					{tClient('common.emptyCart')}
				</div>
			</div>
		</div>
	{:else}
		{@const { lines, id, subtotalPrice } = $cartPreviewResultStore.data.checkout}
		{@const originalTotalPrice = lines
			.map((line) => line.undiscountedTotalPrice.amount)
			.reduce((a, b) => a + b, 0)}
		<CommonTimeLine numberOfItemToEnable={1} />

		<div class="flex flex-row justify-between tablet:flex-wrap tablet:flex-col gap-2">
			<!-- preview area -->
			<div class="w-3/4 tablet:w-full">
				{#each lines as line, idx (idx)}
					<CartItemLine {line} checkoutId={id} />
				{/each}
			</div>

			<!-- purchase area -->
			<div class="w-1/4 tablet:w-full">
				<div class="p-4 mb-2 bg-white rounded-lg border">
					<p class="text-lg font-semibold tet-gray-800 mb-4">{tClient('common.cartSummary')}</p>

					<div class="mb-4">
						{@render MoneyField(
							subtotalPrice.gross.currency,
							originalTotalPrice,
							tClient('common.oldTotalPrice'),
							'gray'
						)}

						{@render MoneyField(
							subtotalPrice.gross.currency,
							originalTotalPrice - subtotalPrice.gross.amount,
							tClient('common.savings'),
							'green',
							true
						)}

						<div class="border-t mb-2"></div>

						{@render MoneyField(
							subtotalPrice.gross.currency,
							subtotalPrice.gross.amount,
							tClient('common.tempoTotalPrice'),
							'red'
						)}
					</div>

					<Button variant="filled" fullWidth size="sm" onclick={handleProceedToCheckout}>
						Proceed to checkout
					</Button>

					<div class="flex items-center justify-center gap-1 mt-2">
						<span class="text-sm font-normal text-gray-500"> or </span>
						<a href="/" class="flex items-center gap-1 text-xs font-medium text-gray-700 underline">
							<span>Continue Shopping</span>
							<Icon icon={ArrowNarrowRight} />
						</a>
					</div>
				</div>

				<!-- coupon -->
				<div class="rounded-lg bg-white p-4 border">
					<Input
						placeholder="Enter discount code"
						size="md"
						class="w-full mb-2"
						label="Do you have a voucher or gift card?"
					/>
					<Button variant="filled" size="sm" fullWidth>Apply code</Button>
				</div>
			</div>
		</div>
	{/if}

	<!-- recommend section -->
	<!-- <div class="mt-6">
		<h3 class="text-lg font-semibold tet-gray-800">People also bought</h3>
		<div class="mt-6 grid grid-cols-3 gap-4 sm:mt-8">
			<div class="space-y-6 overflow-hidden rounded-md-lg bg-white p-6">
				<a href="/" class="overflow-hidden rounded-md">
					<img
						class="h-44 w-44 dark:hidden"
						src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front.svg"
						alt="imac image"
						aria-hidden="true"
					/>
				</a>
				<div>
					<a href="#" class="text-lg font-semibold leading-tight tet-gray-800 hover:underline"
						>iMac 27”</a
					>
					<p class="mt-2 text-base font-normal text-gray-500">
						This generation has some improvements, including a longer continuous battery life.
					</p>
				</div>
				<div>
					<p class="text-lg font-bold tet-gray-800">
						<span class="line-through"> $399,99 </span>
					</p>
					<p class="text-lg font-bold leading-tight text-red-600">$299</p>
				</div>
				<div class="mt-6 flex items-center gap-2.5">
					<button
						data-tooltip-target="favourites-tooltip-1"
						type="button"
						class="inline-flex items-center justify-center gap-2 rounded-md-lg border border-gray-200 bg-white p-2.5 text-sm font-medium tet-gray-800 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100"
					>
						<svg
							class="h-5 w-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6C6.5 1 1 8 5.8 13l6.2 7 6.2-7C23 8 17.5 1 12 6Z"
							></path>
						</svg>
					</button>
					<div
						id="favourites-tooltip-1"
						role="tooltip"
						class="tooltip invisible absolute z-10 inline-block rounded-md-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300"
					>
						Add to favourites
						<div class="tooltip-arrow" data-popper-arrow></div>
					</div>
					<button
						type="button"
						class="inline-flex w-full items-center justify-center rounded-md-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300"
					>
						<svg
							class="-ms-2 me-2 h-5 w-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7h-1M8 7h-.688M13 5v4m-2-2h4"
							/>
						</svg>
						Add to cart
					</button>
				</div>
			</div>
		</div>
	</div> -->
</div>
