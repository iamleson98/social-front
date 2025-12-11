<script lang="ts">
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import type { Money } from '$lib/gql/graphql';
	import type { PaymentSubmitCardValuesProps } from './utils';

	let props: PaymentSubmitCardValuesProps = $props();

	const orderedKeys: Array<keyof PaymentSubmitCardValuesProps> = [
		'authorizedAmount',
		'shipmentCost',
		'selectedProductsValue',
		'previouslyRefunded',
		'replacedProductsValue',
		'maxRefund',
		'refundTotalAmount',
	];
	const highlightedItems: Array<keyof PaymentSubmitCardValuesProps> = [
		'maxRefund',
		'refundTotalAmount',
	];

	const MESSAGE_MAPPING: Record<keyof PaymentSubmitCardValuesProps, string> = {
		authorizedAmount: 'Authorized amount',
		shipmentCost: 'Shipment cost',
		selectedProductsValue: 'Selected products value',
		previouslyRefunded: 'Previously refunded',
		replacedProductsValue: 'Replaced products value',
		maxRefund: 'Max refund',
		refundTotalAmount: 'Refund total amount',
		proposedRefundAmount: 'Proposed refund amount',
	};

	type Item = {
		data: Money;
		highlighted: boolean;
		key: keyof PaymentSubmitCardValuesProps;
	};

	const items = $derived(
		orderedKeys.reduce((acc, cur) => {
			const value = props[cur];

			if (!value) {
				return acc;
			}

			return acc.concat({ data: value, highlighted: highlightedItems.includes(cur), key: cur });
		}, [] as Item[]),
	);
</script>

<div class="text-sm space-y-1">
	{#each items as item, idx (idx)}
		<div class={['flex justify-between text-right', item.highlighted && 'font-bold']}>
			{MESSAGE_MAPPING[item.key]}
			<PriceDisplay {...item.data} />
		</div>
	{/each}
</div>
