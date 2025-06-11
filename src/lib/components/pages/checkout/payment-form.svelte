<script lang="ts">
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import {
		CheckoutAuthorizeStatusEnum,
		CheckoutChargeStatusEnum,
		type Checkout,
		type Mutation,
		type MutationCheckoutCompleteArgs,
		type MutationPaymentGatewayInitializeArgs,
		type PaymentGatewayToInitialize,
	} from '$lib/gql/graphql';
	import {
		CHECKOUT_COMPLETE_MUTATION,
		PAYMENT_GATEWAYS_INITIALIZE_MUTATION,
	} from '$lib/api/checkout';
	import {
		adyenGatewayId,
		paidStatuses,
		supportedPaymentGateways,
		type ParsedPaymentGateways,
		type PaymentStatus,
	} from '$lib/utils/consts';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import AdyenComponent from './adyen-component.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';

	type Props = {
		checkout: Checkout;
	};

	let { checkout }: Props = $props();

	let availablePaymentGateways = $state<ParsedPaymentGateways>([]);

	let paymentStatus = $derived.by<PaymentStatus>(() => {
		if (!checkout) return 'none';

		const { chargeStatus, authorizeStatus } = checkout;

		if (
			chargeStatus === CheckoutChargeStatusEnum.None &&
			authorizeStatus === CheckoutAuthorizeStatusEnum.Full
		)
			return 'authorized';
		if (chargeStatus === CheckoutChargeStatusEnum.Full) return 'paidInFull';
		if (chargeStatus === CheckoutChargeStatusEnum.Overcharged) return 'overpaid';
		return 'none';
	});

	const fetchAvailablePaymentGateways = async () => {
		const paymentGateways: PaymentGatewayToInitialize[] = [];
		for (const gateway of checkout.availablePaymentGateways) {
			if (gateway && supportedPaymentGateways.includes(gateway.id))
				paymentGateways.push({
					id: gateway.id,
					data: gateway.config,
				});
		}

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'paymentGatewayInitialize'>,
			MutationPaymentGatewayInitializeArgs
		>(
			PAYMENT_GATEWAYS_INITIALIZE_MUTATION,
			{
				id: checkout.id,
				paymentGateways,
				amount: checkout.totalPrice.gross.amount,
			},
			{ requestPolicy: 'network-only' },
		);

		if (checkIfGraphqlResultHasError(result, 'paymentGatewayInitialize')) return;

		if (result.data?.paymentGatewayInitialize?.gatewayConfigs)
			availablePaymentGateways = result.data?.paymentGatewayInitialize
				?.gatewayConfigs as ParsedPaymentGateways;
	};

	const completeCheckout = async () => {
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutComplete'>,
			MutationCheckoutCompleteArgs
		>(CHECKOUT_COMPLETE_MUTATION, {
			id: checkout.id,
		});

		if (checkIfGraphqlResultHasError(result, 'checkoutComplete')) return;
	};

	$effect(() => {
		if (checkout.availablePaymentGateways.length) fetchAvailablePaymentGateways();
	});

	$effect(() => {
		if (checkout && paidStatuses.includes(paymentStatus)) completeCheckout();
	});
</script>

<div class="rounded-lg bg-white p-3 border border-gray-200">
	<SectionHeader>Payment method</SectionHeader>
	{#each availablePaymentGateways as gateway, idx (idx)}
		{#if gateway.id === adyenGatewayId}
			<AdyenComponent config={gateway} />
		{/if}
	{/each}
</div>
