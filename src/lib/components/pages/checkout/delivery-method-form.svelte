<script lang="ts">
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { RadioButton } from '$lib/components/ui/Input';
	import type {
		Checkout,
		Maybe,
		Mutation,
		MutationCheckoutDeliveryMethodUpdateArgs,
	} from '$lib/gql/graphql';
	import { CHECKOUT_UPDATE_DELIVERY_METHOD_MUTATION } from '$lib/api/checkout';
	import { formatMoney, checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth/user';
	import SectionHeader from '$lib/components/common/section-header.svelte';

	type Props = {
		checkout: Checkout;
	};

	let { checkout }: Props = $props();

	const getDeliveryMethodSubTitle = (
		minDays: Maybe<number> | undefined,
		maxDays: Maybe<number> | undefined,
	) => {
		if (typeof minDays !== 'number' && typeof maxDays !== 'number') return '';
		return `${minDays || '_'} - ${maxDays || '_'} business days`;
	};

	let selectedShippingMethodId = $state<string>();
	let loading = $state(false);

	const updateDeliveryMethod = async () => {
		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutDeliveryMethodUpdate'>,
			MutationCheckoutDeliveryMethodUpdateArgs
		>(
			CHECKOUT_UPDATE_DELIVERY_METHOD_MUTATION,
			{
				id: checkout.id,
				deliveryMethodId: selectedShippingMethodId,
			},
			{ requestPolicy: 'network-only' },
		);

		loading = false; //

		if (
			checkIfGraphqlResultHasError(
				result,
				'checkoutDeliveryMethodUpdate',
				'Delivery method updated',
			)
		)
			return;
	};

	$effect(() => {
		if (!selectedShippingMethodId) return;

		updateDeliveryMethod();
	});
</script>

<div class="mt-2 bg-white p-3 rounded-lg border">
	<SectionHeader>Shipping method</SectionHeader>

	<div class="flex flex-row flex-wrap">
		{#if !$READ_ONLY_USER_STORE && !checkout.shippingAddress}
			<p>Please provide shipping address first to see available shipping methods</p>
		{/if}
		{#if $READ_ONLY_USER_STORE && !checkout.shippingAddress}
			<p>Loading...</p>
		{:else if checkout.shippingMethods.length}
			{#each checkout.shippingMethods as method, idx (idx)}
				<div class="p-1 w-1/2 text-sm">
					<label class="flex items-center gap-2 rounded-lg border p-3 cursor-pointer">
						<RadioButton
							value={method.id}
							name="shipping-method"
							bind:group={selectedShippingMethodId}
							disabled={loading}
							checked={checkout.deliveryMethod?.id === method.id}
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
