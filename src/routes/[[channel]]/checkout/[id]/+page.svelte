<script lang="ts">
	import { page } from '$app/state';
	import { T } from '$i18n';
	import { CHECKOUT_CUSTOMER_ATTACH_MUTATION, CHECKOUT_DETAILS_QUERY } from '$lib/api/checkout';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { CheckoutSteps } from '$lib/components/common/checkout-steps';
	import CheckoutForm from '$lib/components/pages/checkout/checkout-form.svelte';
	import CheckoutSummary from '$lib/components/pages/checkout/checkout-summary.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type Checkout,
		type Mutation,
		type MutationCheckoutCustomerAttachArgs,
		type Query,
		type QueryCheckoutArgs,
	} from '$lib/gql/graphql';
	import { checkoutStore } from '$lib/stores/app';
	import { UserStoreManager } from '$lib/stores/auth/user';

	const checkoutQueryStore = operationStore<Pick<Query, 'checkout'>, QueryCheckoutArgs>({
		query: CHECKOUT_DETAILS_QUERY,
		variables: {
			id: page.params.id,
		},
	});

	/** attach the logged-in customer to the checkout so the created order belongs to him */
	const attachCustomerIfPossible = async (checkout: Checkout): Promise<void> => {
		const user = $UserStoreManager;
		if (!user || checkout.email) {
			return;
		}

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutCustomerAttach'>,
			MutationCheckoutCustomerAttachArgs
		>(CHECKOUT_CUSTOMER_ATTACH_MUTATION, { id: checkout.id, customerId: user.id });

		const attachedCheckout = result.data?.checkoutCustomerAttach?.checkout;
		if (attachedCheckout) {
			checkoutQueryStore.reexecute({ context: { requestPolicy: 'network-only' } });
		}
	};

	$effect(() => {
		const checkout = $checkoutQueryStore.data?.checkout;
		if (checkout) {
			void attachCustomerIfPossible(checkout);
		}
	});

	/** keep the header cart badge in sync when the checkout is completed elsewhere */
	$effect(() => {
		if ($checkoutQueryStore.data?.checkout) {
			checkoutStore.set($checkoutQueryStore.data.checkout);
		}
	});
</script>

<div>
	{#if $checkoutQueryStore.fetching}
		<div>{$T('common.loading')}</div>
	{:else if $checkoutQueryStore.error}
		<Alert variant="error" size="sm" bordered>{$checkoutQueryStore.error.message}</Alert>
	{:else if $checkoutQueryStore.data?.checkout}
		<CheckoutSteps numberOfItemToEnable={2} />
		<div class="flex flex-row gap-2 flex-nowrap max-tablet:flex-wrap max-tablet:flex-row-reverse">
			<CheckoutForm checkout={$checkoutQueryStore.data.checkout} />
			<CheckoutSummary
				checkout={$checkoutQueryStore.data.checkout}
				editable
				onCheckoutUpdated={() =>
					checkoutQueryStore.reexecute({ context: { requestPolicy: 'network-only' } })}
			/>
		</div>
	{/if}
</div>
