<script lang="ts">
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Ban, Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Input, RadioButton, TextArea } from '$lib/components/ui/Input';
	import { Popover, type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		DiscountValueTypeEnum,
		OrderDiscountType,
		type Order,
		type OrderDiscountCommonInput,
	} from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import OrderLines from './order-lines.svelte';
	import { OrderUtilsInstance } from './utils.svelte';
	import { noop } from 'es-toolkit';

	type Props = {
		loading?: boolean;
		order: Order;
	};

	let { loading, order }: Props = $props();

	const orderDiscountManual = $derived(
		order.discounts.find((discount) => discount.type === OrderDiscountType.Manual),
	);
	const ShippingMethodChoices = $derived(
		order.shippingMethods.map<SelectOption>((method) => ({
			label: `${method.name} : ${method.price.currency} ${method.price.amount}`,
			value: method.id,
			disabled: !method.active,
		})),
	);
	let orderDiscountInput = $state<OrderDiscountCommonInput>({
		value: 0,
		valueType: DiscountValueTypeEnum.Fixed,
		reason: '',
	});
	let alreadyHasManualDiscount = $state(false);

	$effect(() => {
		if (orderDiscountManual) {
			orderDiscountInput = {
				value: orderDiscountManual.value,
				valueType: orderDiscountManual.valueType,
				reason: orderDiscountManual.reason,
			};
			alreadyHasManualDiscount = true;
		}
	});

	const handleClickAddProductVariants = () => {};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Order Lines</div>
		<div>
			<Button size="xs" variant="light" color="red" endIcon={Ban}>Cancel</Button>
			<Button endIcon={Plus} size="xs" color="blue" onclick={handleClickAddProductVariants}>
				Add Products
			</Button>
		</div>
	</SectionHeader>

	{#if !order.lines.length}
		<Alert size="sm" bordered variant="warning">
			This order has no product yet. Please add more.
		</Alert>
	{:else}
		<OrderLines orderLines={order.lines} {order} onFulfillSuccess={noop} />
	{/if}
</div>

<div class={SitenameCommonClassName}>
	<table class="table table-sm">
		<tbody>
			<tr>
				<td>
					<Popover placement="bottom-start">
						{#snippet trigger({ onclick }: DropdownTriggerInterface)}
							<Button size="xs" variant="light" color="blue" {onclick}>Add discount</Button>
						{/snippet}

						<div class="p-3 bg-white rounded-lg shadow-md space-y-2 w-64">
							<SectionHeader>Discount this order by:</SectionHeader>
							<div class="space-y-1">
								{#each Object.values(DiscountValueTypeEnum) as type, idx (idx)}
									<RadioButton
										label={type.toLowerCase()}
										value={type}
										size="sm"
										bind:group={orderDiscountInput.valueType}
										disabled={OrderUtilsInstance.loading}
									/>
								{/each}
							</div>
							<Input
								size="sm"
								placeholder="Discount value"
								label="Discount value"
								type="number"
								required
								bind:value={orderDiscountInput.value}
								disabled={OrderUtilsInstance.loading}
							>
								{#snippet action()}
									<span class="text-xs">
										{orderDiscountInput.valueType === DiscountValueTypeEnum.Fixed
											? order.channel.currencyCode
											: '%'}
									</span>
								{/snippet}
							</Input>
							<TextArea
								size="sm"
								placeholder="Reason"
								label="Reason"
								bind:value={orderDiscountInput.reason}
								disabled={OrderUtilsInstance.loading}
								inputClass="min-h-20"
							/>
							<div class="justify-end flex gap-1">
								{#if alreadyHasManualDiscount}
									<Button size="xs" color="red" onclick={() => {}}>Remove</Button>
								{/if}
								<Button
									size="xs"
									color="blue"
									disabled={orderDiscountInput.value < 0 ||
										!orderDiscountInput.value ||
										OrderUtilsInstance.loading}
									onclick={() => OrderUtilsInstance.orderAddDiscount(order.id, orderDiscountInput)}
								>
									Confirm
								</Button>
							</div>
						</div>
					</Popover>
				</td>
				<td>
					{#if orderDiscountManual}
						<span class="flex items-center gap-2">
							<span>
								{orderDiscountManual.valueType === DiscountValueTypeEnum.Percentage
									? `${orderDiscountManual.value}%`
									: ''}
							</span>
							<PriceDisplay {...orderDiscountManual.total} />
						</span>
					{/if}
				</td>
			</tr>

			<tr>
				<td>Subtotal</td>
				<td>
					<span>
						<PriceDisplay {...order.subtotal.gross} />
					</span>
				</td>
			</tr>

			<tr>
				<td>
					<Popover placement="bottom-start">
						{#snippet trigger({ onclick }: DropdownTriggerInterface)}
							<Button size="xs" variant="light" color="blue" {onclick}>
								{order.shippingMethodName || 'Shipping Method'}
							</Button>
						{/snippet}

						<div class="p-3 w-3xs bg-white rounded-lg shadow-md">
							<Select
								label="Please specify a shipping method"
								options={ShippingMethodChoices}
								disabled={OrderUtilsInstance.loading}
								value={order.deliveryMethod?.id}
								size="sm"
								onchange={(opt) => {
									if (opt)
										OrderUtilsInstance.updateShippingMethod(order.id, {
											shippingMethod: (opt as SelectOption).value as string,
										});
								}}
							/>
						</div>
					</Popover>
				</td>
				<td>
					<span>
						<PriceDisplay {...order.shippingPrice.gross} />
					</span>
				</td>
			</tr>

			<tr>
				<td>Taxes (VAT included)</td>
				<td>
					<span>
						<PriceDisplay {...order.total.tax} />
					</span>
				</td>
			</tr>

			<tr>
				<td>Total</td>
				<td>
					<span>
						<PriceDisplay {...order.total.gross} />
					</span>
				</td>
			</tr>
		</tbody>
	</table>
</div>

<!-- <OrderDraftPage /> -->

<style lang="postcss">
	@reference "tailwindcss";

	tr > td:nth-child(2) {
		@apply text-right;
	}
	tr > td:first-child {
		@apply text-gray-700;
	}
	tr > td:nth-child(2) > * {
		@apply inline-flex;
	}
</style>
