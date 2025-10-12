<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Input, RadioButton, TextArea } from '$lib/components/ui/Input';
	import {
		DiscountValueTypeEnum,
		type Order,
		type OrderDiscountCommonInput,
	} from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { OrderUtilsInstance } from './utils.svelte';

	type Props = {
		order: Order;
		existingDiscount?: OrderDiscountCommonInput;
		onOk?: (discount: OrderDiscountCommonInput) => void;
		onRemove?: () => void;
	};

	let { order, existingDiscount, onOk, onRemove }: Props = $props();

	let loading = $state(false);
	let discountInput = $state<OrderDiscountCommonInput>(
		existingDiscount
			? {
					value: existingDiscount.value,
					valueType: existingDiscount.valueType,
					reason: existingDiscount.reason,
				}
			: {
					value: 0,
					valueType: DiscountValueTypeEnum.Percentage,
					reason: '',
				},
	);
</script>

<div class="{SitenameCommonClassName} shadow-md w-64">
	<SectionHeader>
		<div>Discount by:</div>
	</SectionHeader>
	<div class="space-y-1">
		{#each Object.values(DiscountValueTypeEnum) as type, idx (idx)}
			<RadioButton
				label={type.toLowerCase()}
				value={type}
				size="sm"
				bind:group={discountInput.valueType}
				disabled={OrderUtilsInstance.state.loading || loading}
			/>
		{/each}
	</div>
	<Input
		size="sm"
		placeholder="Discount value"
		label="Discount value"
		type="number"
		required
		bind:value={discountInput.value}
		disabled={OrderUtilsInstance.state.loading || loading}
	>
		{#snippet action()}
			<span class="text-xs">
				{discountInput.valueType === DiscountValueTypeEnum.Fixed ? order.channel.currencyCode : '%'}
			</span>
		{/snippet}
	</Input>
	<TextArea
		size="sm"
		placeholder="Reason"
		label="Reason"
		bind:value={discountInput.reason}
		disabled={OrderUtilsInstance.state.loading || loading}
		inputClass="min-h-20"
	/>
	<div class="justify-end flex gap-1">
		{#if existingDiscount}
			<Button size="xs" color="red" onclick={onRemove}>Remove</Button>
		{/if}
		<Button
			size="xs"
			color="blue"
			disabled={!discountInput.value || OrderUtilsInstance.state.loading || loading}
			onclick={() => onOk?.(discountInput)}
		>
			Confirm
		</Button>
	</div>
</div>
