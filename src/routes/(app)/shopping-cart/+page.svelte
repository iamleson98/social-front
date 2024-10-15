<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { tClient } from '$i18n';
	import { graphqlClient } from '$lib/client';
	import { ArrowNarrowRight, EmptyDrawer, Icon, Minus, Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import type { CheckoutLineInput, Money, Query, QueryProductVariantsArgs } from '$lib/gql/graphql';
	import { operationStore, PRODUCT_VARIANTS_BY_IDS } from '$lib/stores/api';
	import { cartItemStore } from '$lib/stores/app';
	import { alertStore } from '$lib/stores/ui/alert-modal';
	import { toastStore } from '$lib/stores/ui/toast';
	import { AppRoute } from '$lib/utils';
	import { ACCESS_TOKEN_KEY, CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault, getCookieByKey } from '$lib/utils/cookies';
	import { formatMoney, noop, preHandleGraphqlResult } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	const handleItemQuantityInput = (idx: number, e: any) => {
		const { value } = e.target as HTMLInputElement;
		const valueNumber = Math.round(Number(value));

		const items = get(cartItemStore);

		if (valueNumber <= 0)
			alertStore.openAlertModal({
				content: tClient('common.confirmRemoveProduct'),
				onOk: () => cartItemStore.set(items.filter((_, index) => index !== idx)),
				onCancel: () =>
					cartItemStore.set(
						items.map((item, index) => (index === idx ? { ...item, quantity: 1 } : item))
					)
			});
		else
			cartItemStore.set(
				items.map((item, index) => (index === idx ? { ...item, quantity: valueNumber } : item))
			);
	};

	const modifyCartItemQuantity = async (itemIdx: number, delta: -1 | 1) => {
		const items = get(cartItemStore);
		const item = items[itemIdx];

		if (
			delta === 1 &&
			typeof item.quantityAvailable === 'number' &&
			item.quantity >= item.quantityAvailable
		)
			return;

		cartItemStore.set(
			items.map((item, idx) => {
				if (idx !== itemIdx) return item;

				if (delta === -1 && item.quantity + delta <= 0) {
					alertStore.openAlertModal({
						content: tClient('common.confirmRemoveProduct'),
						onOk: () => cartItemStore.set(items.filter((_, index) => index !== idx)),
						onCancel: noop
					});
					return item;
				}

				return {
					...item,
					quantity: item.quantity + delta
				};
			})
		);
	};

	afterNavigate(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	});

	onMount(async () => {
		const items = get(cartItemStore);
		if (!items.length) return;

		const result = await graphqlClient
			.query<Pick<Query, 'productVariants'>, QueryProductVariantsArgs>(PRODUCT_VARIANTS_BY_IDS, {
				channel: clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug),
				ids: items.map((item) => item.variantId as string),
				first: items.length
			})
			.toPromise();

		if (preHandleGraphqlResult(result) || !result.data?.productVariants?.edges) return;

		const variantPriceMap: Record<string, Money> = {};
		for (const {
			node: { pricing, id }
		} of result.data?.productVariants?.edges) {
			variantPriceMap[id] = pricing?.price?.gross as Money;
		}

		cartItemStore.set(
			items.map((item) =>
				!item.variantId ? item : { ...item, grossPrice: variantPriceMap[item.variantId] }
			)
		);
	});

	const handleProceedToCheckout = async () => {
		const cartItems = get(cartItemStore);
		if (!cartItems.length) return;

		const headers: HeadersInit = {};
		const token = getCookieByKey(ACCESS_TOKEN_KEY);

		if (token.length) headers.Authorization = `Bearer ${token}`;

		const result = await fetch(`${AppRoute.CHECKOUT}/get-or-create`, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				lines: cartItems.map<CheckoutLineInput>((item) => ({
					variantId: item.variantId as string,
					quantity: item.quantity
				}))
			})
		});

		const jsonResult = await result.json();
		if (jsonResult.error) {
			toastStore.send({
				message: jsonResult.error,
				variant: 'error'
			});
			return;
		}

		await goto(`${AppRoute.CHECKOUT}/${jsonResult.id}`, { invalidateAll: true });
	};
</script>

<div>
	<h3 class="text-md mb-4 font-semibold text-gray-800">{tClient('common.cart')}</h3>

	{#if !$cartItemStore.length}
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
		<div class="flex flex-row justify-between tablet:flex-wrap tablet:flex-col gap-2">
			<!-- preview area -->
			<div class="w-3/4 tablet:w-full">
				{#each $cartItemStore as item, idx (idx)}
					<div class="bg-white rounded-md p-4 w-full border mb-2">
						<div class="flex items-center gap-2">
							<img
								src={item.previewImage}
								alt={item.previewImageAlt}
								class="w-16 h-16 object-cover"
							/>
							<div class="flex-1">
								<a
									href={`${AppRoute.PRODUCTS}/${encodeURIComponent(item.productSlug)}`}
									class="text-gray-800 text-md hover:underline"
								>
									{item.productName}
								</a>
								<div class="flex items-center text-gray-500 text-xs mt-2 gap-2"></div>
							</div>
							<div class="flex items-center gap-2">
								<IconButton
									icon={Minus}
									size="sm"
									color="red"
									variant="light"
									onclick={() => modifyCartItemQuantity(idx, -1)}
								/>
								<Input
									size="sm"
									bind:value={item.quantity}
									min={0}
									oninput={(e) => handleItemQuantityInput(idx, e)}
									type="number"
									class="!w-16"
								/>
								<IconButton
									icon={Plus}
									size="sm"
									variant="light"
									onclick={() => modifyCartItemQuantity(idx, 1)}
									disabled={typeof item.quantityAvailable === 'number' &&
										item.quantityAvailable <= item.quantity}
								/>
							</div>
							<span class="text-gray-800 font-bold">
								{formatMoney(
									item.grossPrice?.currency as string,
									(item.grossPrice?.amount as number) * item.quantity
								)}
							</span>
						</div>
					</div>
				{/each}
			</div>

			<!-- purchase area -->
			<div class="w-1/4 tablet:w-full bg-white rounded-md border">
				<!-- checkout button -->
				<div class="space-y-4 p-4 mb-4">
					<p class="text-lg font-semibold tet-gray-800">Order summary</p>

					<div class="space-y-4">
						<div class="space-y-2">
							<dl class="flex items-center justify-between gap-4">
								<dt class="text-sm font-normal text-gray-500">Original price</dt>
								<dd class="text-base font-medium tet-gray-800">$7,592.00</dd>
							</dl>

							<dl class="flex items-center justify-between gap-4">
								<dt class="text-sm font-normal text-gray-500">Savings</dt>
								<dd class="text-base font-medium text-green-600">-$299.00</dd>
							</dl>

							<dl class="flex items-center justify-between gap-4">
								<dt class="text-sm font-normal text-gray-500">Store Pickup</dt>
								<dd class="text-base font-medium tet-gray-800">$99</dd>
							</dl>

							<dl class="flex items-center justify-between gap-4">
								<dt class="text-sm font-normal text-gray-500">Tax</dt>
								<dd class="text-base font-medium tet-gray-800">$799</dd>
							</dl>
						</div>

						<dl class="flex items-center justify-between gap-4 border-t border-gray-200 pt-2">
							<dt class="text-base font-bold tet-gray-800">Total</dt>
							<dd class="text-base font-bold tet-gray-800">$8,191.00</dd>
						</dl>
					</div>

					<Button variant="filled" fullWidth size="sm" onclick={handleProceedToCheckout}
						>Proceed to checkout</Button
					>

					<div class="flex items-center justify-center gap-2">
						<span class="text-sm font-normal text-gray-500"> or </span>
						<a
							href="/"
							class="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline"
						>
							Continue Shopping
							<Icon icon={ArrowNarrowRight} />
						</a>
					</div>
				</div>

				<!-- coupon -->
				<div class="space-y-4 rounded-md bg-white p-4">
					<Input
						placeholder="Enter discount code"
						size="md"
						class="w-full"
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
