<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { T } from '$i18n';
	import { operationStore } from '$lib/api/operation';
	import { CUSTOMER_ORDER_QUERY } from '$lib/api/orders';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { Spin } from '$lib/components/ui/Loading';
	import type { Query, QueryOrderArgs } from '$lib/gql/graphql';
	import { defaultSlideShowState } from '$lib/stores/ui/slideshow';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { orderStatusBadgeClass, paymentStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	const orderStore = operationStore<Pick<Query, 'order'>, QueryOrderArgs>({
		query: CUSTOMER_ORDER_QUERY,
		variables: {
			id: page.params.id as string,
		},
		requestPolicy: 'cache-and-network',
	});

	/** `true` when the user has just been redirected here after a successful checkout */
	const justPlaced = $derived(page.url.searchParams.get('placed') === '1');

	const order = $derived($orderStore.data?.order);

	const handleContinueShopping = (): void => {
		const cleanedUrl = AppRoute.ORDER_DETAILS(page.params.id as string);
		void goto(cleanedUrl, { replaceState: true });
	};
</script>

<svelte:head>
	<title
		>{order ? `${$T('order.orderNumber')} ${order.number}` : $T('pages.checkout')} - Sitename</title
	>
	{#if justPlaced}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

{#if $orderStore.fetching && !order}
	<div class="flex justify-center items-center py-32">
		<Spin dimension={32} classes="text-blue-500" />
	</div>
{:else if $orderStore.error}
	<Alert variant="error" size="sm" bordered>{$orderStore.error.message}</Alert>
{:else if order}
	<div class="space-y-2">
		{#if justPlaced}
			<div class="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
				<h1 class="text-2xl font-bold text-green-700 mb-1">{$T('order.thankYou')}</h1>
				<p class="text-sm text-green-700">
					{$T('order.placedSuccessfully', { number: order.number })}
				</p>
				<p class="text-xs text-green-600 mt-1">{$T('order.confirmationHint')}</p>
			</div>
		{/if}

		<!-- header -->
		<div
			class="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-2"
		>
			<div>
				<div class="text-xs text-gray-500">{$T('order.orderNumber')}</div>
				<div class="text-lg font-bold text-gray-700">#{order.number}</div>
				<div class="text-xs text-gray-500">
					{dayjs(order.created).format(SitenameTimeFormat)}
				</div>
			</div>
			<div class="flex items-center gap-2">
				{#if order.paymentStatus}
					<Badge {...paymentStatusBadgeClass(order.paymentStatus)} rounded />
				{/if}
				{#if order.status}
					<Badge {...orderStatusBadgeClass(order.status)} rounded />
				{/if}
			</div>
		</div>

		<div class="flex flex-row gap-2 flex-wrap">
			<!-- lines -->
			<div class="bg-white rounded-lg border border-gray-200 p-4 flex-1 min-w-[300px] space-y-3">
				<h2 class="font-semibold text-gray-700">{$T('order.orderItems')}</h2>
				{#each order.lines as line (line.id)}
					<div
						class="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-none last:pb-0"
					>
						<div
							class="h-16 w-16 rounded-md border border-gray-200 overflow-hidden bg-white shrink-0"
						>
							<img
								src={line.thumbnail?.url || defaultSlideShowState.medias[0].url}
								alt={line.thumbnail?.alt || line.productName}
								class="h-full w-full object-contain"
							/>
						</div>
						<div class="flex-1 min-w-0">
							{#if line.variant?.product?.slug}
								<a
									href={AppRoute.PRODUCT_DETAILS(line.variant.product.slug)}
									class="font-semibold text-gray-700 hover:underline"
								>
									{line.productName}
								</a>
							{:else}
								<span class="font-semibold text-gray-700">{line.productName}</span>
							{/if}
							{#if line.variantName}
								<div class="text-xs text-gray-500">{line.variantName}</div>
							{/if}
							<div class="text-xs text-gray-500">
								{$T('product.quantity')}: {line.quantity}
								{#if line.quantityFulfilled > 0}
									&middot; {$T('order.fulfilled', { quantity: line.quantityFulfilled })}
								{/if}
							</div>
						</div>
						<div class="text-right shrink-0">
							<PriceDisplay {...line.totalPrice.gross} />
							<div class="text-xs text-gray-400">
								{line.quantity} &times; {`${line.unitPrice.gross.amount}`}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- summary + address -->
			<div class="w-1/3 min-w-[280px] max-tablet:w-full space-y-2">
				<div class="bg-white rounded-lg border border-gray-200 p-4 space-y-1.5">
					<h2 class="font-semibold text-gray-700 mb-2">{$T('checkout.summary')}</h2>
					<div class="flex justify-between text-sm">
						<span class="text-gray-500">{$T('payment.subtotal')}</span>
						<PriceDisplay {...order.subtotal.gross} />
					</div>
					{#if order.isShippingRequired}
						<div class="flex justify-between text-sm">
							<span class="text-gray-500">{$T('checkout.shippingCost')}</span>
							<PriceDisplay {...order.shippingPrice.gross} />
						</div>
					{/if}
					{#each order.discounts as discount (discount.name)}
						<div class="flex justify-between text-sm text-green-700">
							<span>{discount.name}</span>
							<span>-{`${discount.amount.amount}`}</span>
						</div>
					{/each}
					{#if order.voucherCode}
						<div class="flex justify-between text-sm text-gray-600">
							<span>{$T('checkout.voucher')}: {order.voucherCode}</span>
						</div>
					{/if}
					<div class="flex justify-between font-bold border-t border-gray-200 pt-2">
						<span>{$T('checkout.totalPrice')}</span>
						<PriceDisplay {...order.total.gross} />
					</div>
					{#if order.total.tax.amount > 0}
						<div class="text-xs text-gray-400 text-right">
							{$T('checkout.includesTax', { amount: `${order.total.tax.amount}` })}
						</div>
					{/if}
				</div>

				{#if order.shippingAddress}
					<div class="bg-white rounded-lg border border-gray-200 p-4">
						<h2 class="font-semibold text-gray-700 mb-2">{$T('checkout.deliveryAddress')}</h2>
						<div class="text-sm text-gray-600 leading-5">
							{order.shippingAddress.firstName}
							{order.shippingAddress.lastName}
							{#if order.shippingAddress.companyName}<br />{order.shippingAddress.companyName}{/if}
							<br />
							{order.shippingAddress.streetAddress1}
							{#if order.shippingAddress.streetAddress2}<br />{order.shippingAddress
									.streetAddress2}{/if}
							<br />
							{order.shippingAddress.city}
							{#if order.shippingAddress.cityArea}, {order.shippingAddress.cityArea}{/if}
							<br />
							{order.shippingAddress.postalCode}
							{#if order.shippingAddress.countryArea}, {order.shippingAddress.countryArea}{/if}
							<br />
							{order.shippingAddress.country?.country}
							{#if order.shippingAddress.phone}<br />{order.shippingAddress.phone}{/if}
						</div>
					</div>
				{/if}

				{#if order.fulfillments?.length}
					<div class="bg-white rounded-lg border border-gray-200 p-4">
						<h2 class="font-semibold text-gray-700 mb-2">{$T('order.fulfillments')}</h2>
						{#each order.fulfillments as fulfillment (fulfillment.id)}
							<div class="text-sm text-gray-600 border-b border-gray-100 py-1.5 last:border-none">
								<div class="flex justify-between">
									<span>{dayjs(fulfillment.created).format(SitenameTimeFormat)}</span>
									<span class="font-medium">{fulfillment.status}</span>
								</div>
								{#if fulfillment.trackingNumber}
									<div class="text-xs text-gray-400">
										{$T('order.trackingNumber')}: {fulfillment.trackingNumber}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		{#if justPlaced}
			<div class="flex justify-center mt-2">
				<Button variant="filled" onclick={handleContinueShopping}
					>{$T('cart.continueShopping')}</Button
				>
			</div>
		{/if}
	</div>
{/if}
