<script lang="ts">
	import type { Checkout } from '$lib/gql/graphql';
	import { getCookieByKey } from '$lib/utils';
	import type { ParsedAdyenGateway } from '$lib/utils/consts';
	import { LANGUAGE_KEY } from '$lib/utils/consts';
	import { toMinorUnits } from '$lib/utils/consts';
	import {
		AdyenCheckout,
		type AdyenCheckoutError,
		Card,
		CashAppPay,
		Dropin,
		GooglePay,
		ApplePay,
		type PaymentCompletedData,
		PayPal,
		type UIElement,
		type DropinConfiguration,
		type PaymentFailedData,
	} from '@adyen/adyen-web';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		config: ParsedAdyenGateway;
		/** the current checkout, used to derive amount / currency / country */
		checkout?: Checkout | null;
		/** called when the payment has been completed successfully */
		onPaymentCompleted?: () => void;
		/** called when the payment failed or was cancelled */
		onPaymentFailed?: () => void;
	}

	const { config, checkout = null, onPaymentCompleted, onPaymentFailed }: Props = $props();

	let adyenComponent: HTMLDivElement;

	onMount(async () => {
		if (!adyenComponent) {
			return;
		}

		// prefer the client key delivered by the gateway init payload,
		// fallback to the publicly exposed env variable
		const clientKey = config.data?.clientKey || import.meta.env.PUBLIC_ADYEN_CLIENT_KEY;
		if (!clientKey) {
			toast.error('Adyen client key is missing');
			return;
		}

		const currency = checkout?.totalPrice?.gross?.currency || 'USD';
		const grossAmount = checkout?.totalPrice?.gross?.amount || 0;
		const locale = getCookieByKey(LANGUAGE_KEY) || 'en-US';
		const countryCode =
			checkout?.shippingAddress?.country?.code || checkout?.billingAddress?.country?.code || 'US';

		const adyen = await AdyenCheckout({
			clientKey,
			environment: (config.data?.environment as 'test' | 'live') || 'test',
			countryCode,
			amount: {
				value: toMinorUnits(grossAmount, currency),
				currency,
			},
			locale,
			analytics: {
				enabled: false,
			},
			onError(error: AdyenCheckoutError) {
				toast.error(error.message);
			},
			onPaymentCompleted(_data: PaymentCompletedData, _element: UIElement) {
				onPaymentCompleted?.();
			},
			onPaymentFailed(_data: PaymentFailedData, _element: UIElement) {
				onPaymentFailed?.();
			},
		});

		const dropinConfiguration: DropinConfiguration = {
			paymentMethodsConfiguration: {
				card: {
					_disableClickToPay: true,
				},
			},
			paymentMethodComponents: [Card, PayPal, CashAppPay, GooglePay, ApplePay],
		};

		const drop = new Dropin(adyen, dropinConfiguration);
		drop.mount(adyenComponent);
	});
</script>

<div bind:this={adyenComponent}></div>
