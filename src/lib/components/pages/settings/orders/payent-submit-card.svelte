<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input, RadioButton } from '$lib/components/ui/Input';
	import type { Money, Order } from '$lib/gql/graphql';
	import type { SocialVariant } from '$lib/utils';
	import PaymentSubmitCardValues from './payment-submit-card-values.svelte';
	import type { RefundQuantityProps } from './utils';

	type Props = {
		// order: Order;
		// refundedProductQuantities: RefundQuantityProps[];
		// refundedFulfilledProductQuantities: RefundQuantityProps[];

		authorizedAmount?: Money;
		shipmentCost?: Money;
		selectedProductsValue?: Money;
		previouslyRefunded?: Money;
		maxRefund?: Money;
		proposedRefundAmount?: Money;
		refundTotalAmount?: Money;
		isProductRefund: boolean;
		disableRefundButton: boolean;
		refundShipmentCosts: boolean;
	};

	let {
		// order,
		// refundedProductQuantities,
		// refundedFulfilledProductQuantities,
		authorizedAmount,
		shipmentCost,
		selectedProductsValue,
		previouslyRefunded,
		maxRefund,
		proposedRefundAmount,
		refundTotalAmount,
		isProductRefund,
		disableRefundButton,
		refundShipmentCosts = $bindable(),
	}: Props = $props();

	type AmountInputType = 'no-refund' | 'automatic-amount' | 'manual-amount';

	console.log(proposedRefundAmount);

	type RefundProps = {
		label: string;
		amountType: AmountInputType;
		disabled?: boolean;
	};

	const REFUND_AMOUNT_OPTIONS: RefundProps[] = [
		{
			label: 'No refund',
			amountType: 'no-refund',
			disabled: true,
		},
		{
			label: 'Automatic amount',
			amountType: 'automatic-amount',
		},
		{
			label: 'Manual amount',
			amountType: 'manual-amount',
		},
	];

	let amountType = $state<AmountInputType>('automatic-amount');
	let refundInputAmount = $state(proposedRefundAmount?.amount ?? 0);
	let inputAmountVariant = $derived<SocialVariant>(
		refundInputAmount < 0 || (maxRefund?.amount && refundInputAmount > maxRefund?.amount)
			? 'error'
			: 'info',
	);
</script>

{#snippet refundInput()}
	<Input
		placeholder="Proposed refund amount"
		bind:value={refundInputAmount}
		min={0}
		max={maxRefund?.amount}
		label="Enter amount"
		type="number"
		variant={inputAmountVariant}
		subText={inputAmountVariant === 'error' ? 'Amount is out of range' : undefined}
	>
		{#snippet action()}
			<span class="text-[10px] font-semibold">{maxRefund?.currency}</span>
		{/snippet}
	</Input>
{/snippet}

<div class="space-y-2">
	<SectionHeader>Refunded Amount</SectionHeader>

	{#each REFUND_AMOUNT_OPTIONS as type, idx (idx)}
		<RadioButton
			value={type.amountType}
			bind:group={amountType}
			disabled={type.disabled}
			label={type.label}
			size="sm"
		/>
	{/each}

	{#if amountType !== 'no-refund'}
		<Checkbox label="Refund shippent costs" size="sm" bind:checked={refundShipmentCosts} />
	{/if}

	<hr />

	{#if isProductRefund}
		{#if amountType === 'no-refund'}
			<PaymentSubmitCardValues
				authorizedAmount={authorizedAmount!}
				shipmentCost={refundShipmentCosts ? shipmentCost : undefined}
				previouslyRefunded={previouslyRefunded!}
				maxRefund={maxRefund!}
			/>
		{:else if amountType === 'automatic-amount'}
			<PaymentSubmitCardValues
				authorizedAmount={authorizedAmount!}
				previouslyRefunded={previouslyRefunded!}
				maxRefund={maxRefund!}
				selectedProductsValue={selectedProductsValue!}
				refundTotalAmount={refundTotalAmount!}
				shipmentCost={refundShipmentCosts ? shipmentCost : undefined}
			/>
		{:else if amountType === 'manual-amount'}
			<PaymentSubmitCardValues
				authorizedAmount={authorizedAmount!}
				shipmentCost={refundShipmentCosts ? shipmentCost : undefined}
				previouslyRefunded={previouslyRefunded!}
				maxRefund={maxRefund!}
				proposedRefundAmount={proposedRefundAmount!}
			/>

			{@render refundInput()}
		{/if}
	{:else}
		<PaymentSubmitCardValues
			authorizedAmount={authorizedAmount!}
			previouslyRefunded={previouslyRefunded!}
			maxRefund={maxRefund!}
		/>

		{@render refundInput()}
	{/if}

	<Button fullWidth disabled={disableRefundButton || inputAmountVariant === 'error'} color="gray"
		>Refund</Button
	>
</div>
