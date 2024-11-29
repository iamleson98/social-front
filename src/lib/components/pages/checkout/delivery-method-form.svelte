<script lang="ts">
	import { graphqlClient } from '$lib/client';
	import { RadioButton } from '$lib/components/ui/Input';
	import type { Maybe, Mutation, MutationCheckoutDeliveryMethodUpdateArgs } from '$lib/gql/graphql';
	import { CHECKOUT_UPDATE_DELIVERY_METHOD_MUTATION } from '$lib/stores/api/checkout';
	import { checkoutStore } from '$lib/stores/app';
	import { userStore } from '$lib/stores/auth';
	import { toastStore } from '$lib/stores/ui/toast';
	import { formatMoney, preHandleGraphqlResult } from '$lib/utils/utils';

	const getDeliveryMethodSubTitle = (
		minDays: Maybe<number> | undefined,
		maxDays: Maybe<number> | undefined
	) => {
		if (typeof minDays !== 'number' && typeof maxDays !== 'number') return '';
		return `${minDays || '_'} - ${maxDays || '_'} business days`;
	};

	let selectedShippingMethodId = $state<string>();
	let updating = $state(false);

	$effect(() => {
		if (!selectedShippingMethodId || !$checkoutStore) return;

		updating = true; //
		graphqlClient
			.mutation<
				Pick<Mutation, 'checkoutDeliveryMethodUpdate'>,
				MutationCheckoutDeliveryMethodUpdateArgs
			>(
				CHECKOUT_UPDATE_DELIVERY_METHOD_MUTATION,
				{
					id: $checkoutStore?.id,
					deliveryMethodId: selectedShippingMethodId
				},
				{ requestPolicy: 'network-only' }
			)
			.toPromise()
			.then((result) => {
				if (preHandleGraphqlResult(result)) return;
				if (result.data?.checkoutDeliveryMethodUpdate?.errors.length) {
					toastStore.send({
						message: result.data.checkoutDeliveryMethodUpdate.errors[0].message as string,
						variant: 'error'
					});
					return;
				}
			})
			.catch((err) =>
				toastStore.send({
					message: err,
					variant: 'error'
				})
			)
			.finally(() => {
				updating = false; //
			});
	});
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
						<RadioButton
							value={method.id}
							name="shipping-method"
							bind:group={selectedShippingMethodId}
							disabled={updating}
							checked={$checkoutStore.deliveryMethod?.id === method.id}
						/>
						<div>
							<div>
								<p class="font-semibold text-gray-700">{method.name}</p>
								<p class="text-red-600 text-xs">
									{formatMoney(method.price.currency, method.price.amount)}
								</p>
							</div>
							{getDeliveryMethodSubTitle(method.minimumDeliveryDays, method.maximumDeliveryDays)}
						</div>
					</label>
				</div>
			{/each}
		{:else}
			<p class="text-sm">No shipping method available</p>
		{/if}
	</div>
</div>
