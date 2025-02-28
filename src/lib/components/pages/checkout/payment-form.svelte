<script lang="ts">
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import {
		CheckoutAuthorizeStatusEnum,
		CheckoutChargeStatusEnum,
		type Mutation,
		type MutationCheckoutCompleteArgs,
		type MutationPaymentGatewayInitializeArgs,
		type PaymentGatewayToInitialize
	} from '$lib/gql/graphql';
	import {
		CHECKOUT_COMPLETE_MUTATION,
		PAYMENT_GATEWAYS_INITIALIZE_MUTATION
	} from '$lib/api/checkout';
	import { checkoutStore } from '$lib/stores/app';
	import { toastStore } from '$lib/stores/ui/toast';
	import {
		adyenGatewayId,
		paidStatuses,
		supportedPaymentGateways,
		type ParsedPaymentGateways,
		type PaymentStatus
	} from '$lib/utils/consts';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import AdyenComponent from './adyen-component.svelte';

	let availablePaymentGateways = $state<ParsedPaymentGateways>([]);

	let paymentStatus = $derived.by<PaymentStatus>(() => {
		if (!$checkoutStore) return 'none';

		const { chargeStatus, authorizeStatus } = $checkoutStore;

		if (
			chargeStatus === CheckoutChargeStatusEnum.None &&
			authorizeStatus === CheckoutAuthorizeStatusEnum.Full
		)
			return 'authorized';
		if (chargeStatus === CheckoutChargeStatusEnum.Full) return 'paidInFull';
		if (chargeStatus === CheckoutChargeStatusEnum.Overcharged) return 'overpaid';
		return 'none';
	});

	$effect(() => {
		if ($checkoutStore && $checkoutStore?.availablePaymentGateways?.length) {
			const paymentGateways = $checkoutStore.availablePaymentGateways.reduce<
				PaymentGatewayToInitialize[]
			>(
				(acc, gateway) =>
					!!gateway && supportedPaymentGateways.includes(gateway.id)
						? acc.concat({
								id: gateway.id,
								data: gateway.config
							})
						: acc,
				[]
			);

			GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'paymentGatewayInitialize'>,
				MutationPaymentGatewayInitializeArgs
			>(
				PAYMENT_GATEWAYS_INITIALIZE_MUTATION,
				{
					id: $checkoutStore.id,
					paymentGateways,
					amount: $checkoutStore.totalPrice.gross.amount
				},
				{ requestPolicy: 'network-only' }
			)
				.toPromise()
				.then((result) => {
					if (preHandleErrorOnGraphqlResult(result, 'paymentGatewayInitialize')) return;

					availablePaymentGateways = result.data?.paymentGatewayInitialize
						?.gatewayConfigs as ParsedPaymentGateways;
				})
				.catch((err) => {
					toastStore.send({
						message: err,
						variant: 'error'
					});
				});
		}
	});

	$effect(() => {
		if ($checkoutStore && paidStatuses.includes(paymentStatus)) {
			GRAPHQL_CLIENT.mutation<Pick<Mutation, 'checkoutComplete'>, MutationCheckoutCompleteArgs>(
				CHECKOUT_COMPLETE_MUTATION,
				{
					id: $checkoutStore.id
				},
				{ requestPolicy: 'network-only' }
			)
				.toPromise()
				.then((result) => {
					if (preHandleErrorOnGraphqlResult(result, 'checkoutComplete')) return;
				})
				.catch((err) => {
					toastStore.send({
						message: err,
						variant: 'error'
					});
				});
		}
	});
</script>

<div class="rounded-lg bg-white p-3 border">
	{#each availablePaymentGateways as gateway, idx (idx)}
		{#if gateway.id === adyenGatewayId}
			<AdyenComponent config={gateway} />
		{/if}
	{/each}
</div>
