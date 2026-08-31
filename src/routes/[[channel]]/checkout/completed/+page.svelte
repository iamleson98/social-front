<script lang="ts">
	import { page } from '$app/state';
	import { T } from '$i18n';
	import { Icon, CircleCheckFilled } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';

	/** id of the order created by `checkoutComplete` */
	const orderId = $derived(page.url.searchParams.get('orderId'));
</script>

<div class="flex flex-col items-center justify-center py-20 px-4 text-center">
	<Icon icon={CircleCheckFilled} size="xl" class="text-green-600" />

	<h1 class="text-2xl font-bold text-gray-700 mt-4">{$T('order.thankYou')}</h1>
	<p class="text-gray-500 mt-2 max-w-md">
		{$T('order.confirmationHint')}
	</p>

	<div class="flex gap-2 mt-6">
		{#if orderId}
			<a href={AppRoute.ORDER_DETAILS(orderId)}>
				<Button variant="filled">{$T('order.viewDetails')}</Button>
			</a>
		{/if}
		<a href={AppRoute.HOME()}>
			<Button variant="outline">{$T('cart.continueShopping')}</Button>
		</a>
	</div>

	{#if orderId}
		<a href={AppRoute.MY_ORDERS()} class="text-xs text-gray-400 hover:underline mt-6">
			{$T('settings.myOrders')}
		</a>
	{/if}
</div>
