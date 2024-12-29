<script lang="ts">
	import type { ParsedAdyenGateway } from '$lib/utils/consts';
	import { onMount } from 'svelte';
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
		type PaymentFailedData
	} from '@adyen/adyen-web';

	type Props = {
		config: ParsedAdyenGateway;
	};

	let { config }: Props = $props();

	let adyenComponent: HTMLDivElement;
	// let adyenDropinComponent:

	// config.data.paymentMethodsResponse.

	onMount(async () => {
		if (adyenComponent) {
			const adyen = await AdyenCheckout({
				clientKey: import.meta.env.VITE_ADYEN_CLIENT_KEY,
				environment: 'test',
				countryCode: 'US',
				amount: {
					value: 23,
					currency: 'USD'
				},
				locale: 'en-US',
				analytics: {
					enabled: false
				},
				onError(error: AdyenCheckoutError) {
					console.error('Something went wrong', error);
				},
				onPaymentCompleted(data: PaymentCompletedData, element: UIElement) {
					console.log(data, element);
				},
				onPaymentFailed(data: PaymentFailedData, element: UIElement) {
					console.log(data, element);
				}
			});

			const dropinConfiguration: DropinConfiguration = {
				paymentMethodsConfiguration: {
					card: {
						_disableClickToPay: true
					}
				},
				paymentMethodComponents: [Card, PayPal, CashAppPay, GooglePay, ApplePay]
			};

			const drop = new Dropin(adyen, dropinConfiguration);
			drop.mount(adyenComponent);
		}
	});
</script>

<div bind:this={adyenComponent}></div>
