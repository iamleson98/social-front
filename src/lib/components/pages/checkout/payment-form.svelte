<script lang="ts">
	import { goto } from '$app/navigation';
	import { T } from '$i18n';
	import {
		CHECKOUT_COMPLETE_MUTATION,
		PAYMENT_GATEWAYS_INITIALIZE_MUTATION,
	} from '$lib/api/checkout';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		CheckoutAuthorizeStatusEnum,
		CheckoutChargeStatusEnum,
		type Checkout,
		type Mutation,
		type MutationCheckoutCompleteArgs,
		type MutationPaymentGatewayInitializeArgs,
		type PaymentGatewayToInitialize,
	} from '$lib/gql/graphql';
	import { checkoutStore } from '$lib/stores/app';
	import { UserStoreManager } from '$lib/stores/auth/user';
	import {
		adyenGatewayId,
		paidStatuses,
		supportedPaymentGateways,
		type ParsedPaymentGateways,
		type PaymentStatus,
	} from '$lib/utils/consts';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import AdyenComponent from './adyen-component.svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		checkout: Checkout;
		/** guest email typed in the account section; used to pre-check before payment */
		guestEmail?: string;
	}

	const { checkout, guestEmail = '' }: Props = $props();

	let availablePaymentGateways = $state<ParsedPaymentGateways>([]);
	let completingCheckout = $state(false);

	const paymentStatus = $derived.by<PaymentStatus>(() => {
		if (!checkout) {
			return 'none';
		}

		const { chargeStatus, authorizeStatus } = checkout;

		if (
			chargeStatus === CheckoutChargeStatusEnum.None &&
			authorizeStatus === CheckoutAuthorizeStatusEnum.Full
		) {
			return 'authorized';
		}
		if (chargeStatus === CheckoutChargeStatusEnum.Full) {
			return 'paidInFull';
		}
		if (chargeStatus === CheckoutChargeStatusEnum.Overcharged) {
			return 'overpaid';
		}
		return 'none';
	});

	/** the checkout is missing required data to create an order (email / address / delivery method) */
	const completionBlockedReason = $derived.by(() => {
		const hasEmail = !!(
			checkout.email || ($UserStoreManager ? $UserStoreManager.email : guestEmail)
		);
		if (!hasEmail) {
			return $T('checkout.emailRequiredHint');
		}
		if (checkout.isShippingRequired && !checkout.shippingAddress) {
			return $T('checkout.addressRequiredHint');
		}
		if (checkout.isShippingRequired && !checkout.deliveryMethod) {
			return $T('checkout.deliveryMethodRequiredHint');
		}
		return undefined;
	});

	const fetchAvailablePaymentGateways = async (): Promise<void> => {
		const paymentGateways: PaymentGatewayToInitialize[] = [];
		for (const gateway of checkout.availablePaymentGateways) {
			if (gateway && supportedPaymentGateways.includes(gateway.id)) {
				paymentGateways.push({
					id: gateway.id,
					data: gateway.config,
				});
			}
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

		if (checkIfGraphqlResultHasError(result, 'paymentGatewayInitialize')) {
			return;
		}

		if (result.data?.paymentGatewayInitialize?.gatewayConfigs) {
			availablePaymentGateways = result.data?.paymentGatewayInitialize
				?.gatewayConfigs as ParsedPaymentGateways;
		}
	};

	const completeCheckout = async (): Promise<void> => {
		if (completingCheckout) {
			return;
		}
		completingCheckout = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutComplete'>,
			MutationCheckoutCompleteArgs
		>(CHECKOUT_COMPLETE_MUTATION, {
			id: checkout.id,
		});

		completingCheckout = false;

		if (checkIfGraphqlResultHasError(result, 'checkoutComplete')) {
			toast.error(result.data?.checkoutComplete?.errors?.[0]?.message || $T('error.failedToLoad'));
			return;
		}

		const order = result.data?.checkoutComplete?.order;
		// clean up local checkout state and go to the order detail page
		checkoutStore.set(null);
		toast.success($T('order.placedSuccessfullyToast'));

		if (order?.id) {
			void goto(`/checkout/completed?orderId=${encodeURIComponent(order.id)}`, {
				replaceState: true,
			});
		}
	};
	$effect(() => {
		if (checkout.availablePaymentGateways.length) {
			void fetchAvailablePaymentGateways();
		}
	});

	$effect(() => {
		if (checkout && paidStatuses.includes(paymentStatus)) {
			void completeCheckout();
		}
	});
</script>

<div class="rounded-lg bg-white p-3 border border-gray-200">
	<SectionHeader>{$T('checkout.paymentMethod')}</SectionHeader>

	{#if completionBlockedReason}
		<div class="mb-2">
			<Alert variant="warning" size="sm" bordered>{completionBlockedReason}</Alert>
		</div>
	{/if}

	{#each availablePaymentGateways as gateway, idx (idx)}
		{#if gateway.id === adyenGatewayId}
			<AdyenComponent config={gateway} {checkout} onPaymentCompleted={completeCheckout} />
		{/if}
	{/each}

	{#if completingCheckout}
		<div class="text-sm text-gray-500 mt-2">{$T('checkout.processingOrder')}</div>
	{/if}
</div>
