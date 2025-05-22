<script lang="ts">
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { RadioButton } from '$lib/components/ui/Input';
	import type { Maybe, Mutation, MutationCheckoutDeliveryMethodUpdateArgs } from '$lib/gql/graphql';
	import { CHECKOUT_UPDATE_DELIVERY_METHOD_MUTATION } from '$lib/api/checkout';
	import { checkoutStore } from '$lib/stores/app';
	import { formatMoney, checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth/user';

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

		updateDeliveryMethod();
	});

	const updateDeliveryMethod = async () => {
		updating = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutDeliveryMethodUpdate'>,
			MutationCheckoutDeliveryMethodUpdateArgs
		>(
			CHECKOUT_UPDATE_DELIVERY_METHOD_MUTATION,
			{
				id: $checkoutStore?.id,
				deliveryMethodId: selectedShippingMethodId
			},
			{ requestPolicy: 'network-only' }
		);

		updating = false; //

		if (checkIfGraphqlResultHasError(result, 'checkoutDeliveryMethodUpdate', "Delivery method updated")) return;
	};
</script>

<div class="mt-2 bg-white p-3 rounded-lg border">
	<div class="text-sm font-semibold mb-2 text-gray-800">Shipping method</div>

	<div class="flex flex-row flex-wrap">
		{#if !$READ_ONLY_USER_STORE && !$checkoutStore?.shippingAddress}
			<p>Please provide shipping address first to see available shipping methods</p>
		{/if}
		{#if $READ_ONLY_USER_STORE && !$checkoutStore?.shippingAddress}
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
