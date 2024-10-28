<script lang="ts">
	import { checkoutStore } from '$lib/stores/app';
	import { userStore } from '$lib/stores/auth';
	import { formatMoney } from '$lib/utils/utils';
</script>

<div class="mt-2 bg-white p-3 rounded-lg border">
	<div class="text-sm font-semibold mb-2 text-gray-800">Shipping method</div>

	<div class="flex flex-row flex-wrap">
		{#if !$userStore && !$checkoutStore?.shippingAddress}
			<p>Please provide shipping address first to see available shipping methods</p>
		{/if}
		{#if $userStore && !$checkoutStore?.shippingAddress}
			<p>Loading...</p>
		{:else if $checkoutStore?.shippingMethods.length}
			{#each $checkoutStore?.shippingMethods as method, idx (idx)}
				<div class="p-1 w-1/2 text-sm">
					<label class="flex items-center gap-2 rounded-lg border p-3 cursor-pointer">
						<input type="radio" value={method.id} />
						<div>
							<div>
								<p class="font-semibold text-gray-700">{method.name}</p>
								<p class="text-red-600 text-xs">
									{formatMoney(method.price.currency, method.price.amount)}
								</p>
							</div>
							{#if typeof method.minimumDeliveryDays === 'number' || typeof method.maximumDeliveryDays === 'number'}
								<p class="text-xs">
									{method.minimumDeliveryDays || '_'} - {method.maximumDeliveryDays || '_'} business
									days
								</p>
							{/if}
						</div>
					</label>
				</div>
			{/each}
		{:else}
			<p class="text-sm">No shipping method available</p>
		{/if}
	</div>
</div>
