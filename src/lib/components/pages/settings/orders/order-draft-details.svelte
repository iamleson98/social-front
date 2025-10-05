<script lang="ts">
	import { page } from '$app/state';
	import { DRAFT_ORDER_UPDATE_MUTATION, ORDER_UPDATE_MUTATION } from '$lib/api/admin/orders';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Ban, Plus, SettingCog } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { Input, RadioButton, TextArea } from '$lib/components/ui/Input';
	import { Popover, type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		AddressTypeEnum,
		DiscountValueTypeEnum,
		OrderDiscountType,
		OrderStatus,
		type AddressInput,
		type DraftOrderInput,
		type Mutation,
		type MutationDraftOrderUpdateArgs,
		type MutationOrderUpdateArgs,
		type Order,
		type OrderDiscountCommonInput,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import {
		checkIfGraphqlResultHasError,
		orderStatusBadgeClass,
		SitenameCommonClassName,
	} from '$lib/utils/utils';
	import { GeneralMetadataEditor, type GeneralMetadataEditorRef } from '../common';
	import ActionBar from '../common/action-bar.svelte';
	import OrderLinesAssignSection from './new/order-lines-assign-section.svelte';
	import OrderHistory from './order-history.svelte';
	import OrderLines from './order-lines.svelte';
	import Sidebar from './sidebar.svelte';
	import { OrderUtilsInstance } from './utils.svelte';
	import dayjs from 'dayjs';
	import { noop } from 'es-toolkit';
	import { toast } from 'svelte-sonner';

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
	let metaRef = $state<GeneralMetadataEditorRef>();

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

	const handleCancelOrder = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: 'Are you sure you want to cancel this order?',
			onOk: async () => {
				const hasErr = await OrderUtilsInstance.orderCancel(page.params.id!);
				if (!hasErr) toast.success('Order cancelled successfully');
			},
		});
	};

	const reexecuteQuery = () => {};

	/** only draft orders can update customer */
	const handleUpdateCustomer = async (userId: string) => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'draftOrderUpdate'>,
			MutationDraftOrderUpdateArgs
		>(DRAFT_ORDER_UPDATE_MUTATION, {
			id: page.params.id,
			input: {
				user: userId,
				shippingAddress: null,
				billingAddress: null,
			},
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'draftOrderUpdate', 'Customer updated successfully'))
			return;

		reexecuteQuery();
	};

	const handleUpdateAddress = async (
		type: AddressTypeEnum,
		addr: AddressInput,
		alsoSetForTheRest: boolean,
	) => {
		const input: Pick<DraftOrderInput, 'billingAddress' | 'shippingAddress'> = {};
		if (type === AddressTypeEnum.Billing) {
			input.billingAddress = addr;
			if (alsoSetForTheRest) input.shippingAddress = addr;
		} else {
			input.shippingAddress = addr;
			if (alsoSetForTheRest) input.billingAddress = addr;
		}

		loading = true;
		if (order.status === OrderStatus.Draft) {
			const result = await GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'draftOrderUpdate'>,
				MutationDraftOrderUpdateArgs
			>(DRAFT_ORDER_UPDATE_MUTATION, { id: page.params.id, input });
			checkIfGraphqlResultHasError(result, 'draftOrderUpdate', $CommonState.EditSuccess);
		} else {
			const result = await GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'orderUpdate'>,
				MutationOrderUpdateArgs
			>(ORDER_UPDATE_MUTATION, { id: page.params.id, input: input });
			checkIfGraphqlResultHasError(result, 'orderUpdate', $CommonState.EditSuccess);
		}
		loading = false;
	};

	const handleFinalizeOrder = async () => {};
</script>

{#snippet addDiscountDialog()}
	<Popover placement="bottom-start">
		{#snippet trigger({ onclick }: DropdownTriggerInterface)}
			<Button size="xs" disabled={loading} variant="light" color="blue" {onclick}
				>Add discount</Button
			>
		{/snippet}

		<div class="{SitenameCommonClassName} shadow-md w-64">
			<SectionHeader>Discount this order by:</SectionHeader>
			<div class="space-y-1">
				{#each Object.values(DiscountValueTypeEnum) as type, idx (idx)}
					<RadioButton
						label={type.toLowerCase()}
						value={type}
						size="sm"
						bind:group={orderDiscountInput.valueType}
						disabled={OrderUtilsInstance.loading || loading}
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
				disabled={OrderUtilsInstance.loading || loading}
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
				disabled={OrderUtilsInstance.loading || loading}
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
						OrderUtilsInstance.loading ||
						loading}
					onclick={() => OrderUtilsInstance.orderAddDiscount(order.id, orderDiscountInput)}
				>
					Confirm
				</Button>
			</div>
		</div>
	</Popover>
{/snippet}

{#snippet shippingMethodModal()}
	<Popover placement="bottom-start">
		{#snippet trigger({ onclick }: DropdownTriggerInterface)}
			<Button size="xs" variant="light" color="blue" {onclick} disabled={loading}>
				{order.shippingMethodName || 'Shipping Method'}
			</Button>
		{/snippet}

		<div class="{SitenameCommonClassName} w-3xs shadow-md">
			<Select
				label="Please specify a shipping method"
				options={ShippingMethodChoices}
				disabled={OrderUtilsInstance.loading || loading}
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
{/snippet}

<div class="flex flex-row gap-2">
	<div class="space-y-2 w-7/10">
		<SectionHeader class={SitenameCommonClassName}>
			<div class="flex items-center gap-2">
				<div>Order #{order.number}</div>
				<Badge text={order.status} color="gray" variant="outline" rounded />
				<div class="text-xs text-gray-500 font-medium">
					{dayjs(order.created).format(SitenameTimeFormat)}
				</div>
			</div>

			<DropDown placement="bottom-end">
				{#snippet trigger({ onclick }: DropdownTriggerInterface)}
					<IconButton icon={SettingCog} size="sm" color="gray" variant="light" {onclick} />
				{/snippet}

				<MenuItem class="text-red-500" startIcon={Ban} onclick={handleCancelOrder}
					>Cancel order</MenuItem
				>
			</DropDown>
		</SectionHeader>

		<OrderLinesAssignSection {order} onAddedVariants={console.log} />

		<div class="{SitenameCommonClassName} text-sm text-gray-700">
			<div class="flex justify-between">
				<div>{@render addDiscountDialog()}</div>
				<div>
					{#if orderDiscountManual}
						<span class="flex items-center gap-2">
							<span>
								{orderDiscountManual.valueType === DiscountValueTypeEnum.Percentage
									? `${orderDiscountManual.value}%`
									: ''}
							</span>
							<PriceDisplay {...orderDiscountManual.total} />
						</span>
					{:else}
						<span>---</span>
					{/if}
				</div>
			</div>
			<div class="flex justify-between">
				<div>Subtotal</div>
				<div>
					<PriceDisplay {...order.subtotal.gross} />
				</div>
			</div>
			<div class="flex justify-between">
				<div>{@render shippingMethodModal()}</div>
				<div>
					<PriceDisplay {...order.shippingPrice.gross} />
				</div>
			</div>
			<div class="flex justify-between">
				<div>Taxes (VAT included)</div>
				<div>
					<PriceDisplay {...order.total.tax} />
				</div>
			</div>
			<div class="flex justify-between">
				<div>Total</div>
				<div>
					<PriceDisplay {...order.total.gross} />
				</div>
			</div>
		</div>

		<GeneralMetadataEditor
			metadata={order.metadata}
			privateMetadata={order.privateMetadata}
			objectId={order.id}
			disabled={loading}
			bind:this={metaRef}
		/>
		<OrderHistory id={order.id} />
	</div>

	<Sidebar
		{order}
		onDoneCustomerUpdate={reexecuteQuery}
		{handleUpdateCustomer}
		disabled={loading}
		setAddress={handleUpdateAddress}
	/>
</div>

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_ORDERS()}
	onUpdateClick={handleFinalizeOrder}
	updateButtonText="Finalize"
	disabled={loading}
/>

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
