<script lang="ts">
	import { T } from '$i18n';
	import { DRAFT_ORDER_UPDATE_MUTATION, ORDER_UPDATE_MUTATION } from '$lib/api/admin/orders';
	import { CUSTOMER_LIST_QUERY, USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { PencilMinus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { IconButton } from '$lib/components/ui/Button';
	import { Checkbox, RadioButton, TextArea } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import {
		AddressTypeEnum,
		OrderStatus,
		type Address,
		type DraftOrderInput,
		type Mutation,
		type MutationDraftOrderUpdateArgs,
		type MutationOrderUpdateArgs,
		type Order,
		type Query,
		type QueryCustomersArgs,
		type QueryUserArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import {
		checkIfGraphqlResultHasError,
		convertAddressToAddressInput,
		SitenameCommonClassName,
	} from '$lib/utils/utils';

	type Props = {
		order: Order;
		onRefetchOrder?: () => void;
		disabled?: boolean;
	};

	let { order, onRefetchOrder, disabled }: Props = $props();

	let currentSetAddressType = $state<AddressTypeEnum>();
	let alsoUseSelectedAddressForTheOther = $state(false);
	let selectedAddress = $state<Address>();
	let selectedAddressId = $state<string>();
	let enableEditCustomer = $state(false);
	let loading = $state(false);

	const ShouldDisable = $derived(disabled || loading);

	const CustomerQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
		query: USER_DETAIL_QUERY,
		variables: {},
		pause: true,
		requestPolicy: 'cache-and-network',
	});

	const handleClickSetAddress = async (type: AddressTypeEnum) => {
		CustomerQuery.reexecute({ variables: { id: order.user?.id } });
		currentSetAddressType = type;
	};

	/** only draft orders can update customer */
	const handleUpdateCustomer = async (option?: SelectOption | SelectOption[]) => {
		if (!option || order.status !== OrderStatus.Draft) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'draftOrderUpdate'>,
			MutationDraftOrderUpdateArgs
		>(DRAFT_ORDER_UPDATE_MUTATION, {
			id: order.id,
			input: {
				user: (option as SelectOption).value as string,
				shippingAddress: null,
				billingAddress: null,
			},
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'draftOrderUpdate', 'Customer updated successfully'))
			return;

		onRefetchOrder?.();
	};

	const handleSetUserAddresses = async () => {
		if (selectedAddress) {
			const addrInput = convertAddressToAddressInput(selectedAddress);

			const input: Pick<DraftOrderInput, 'billingAddress' | 'shippingAddress'> = {};
			if (currentSetAddressType === AddressTypeEnum.Billing) {
				input.billingAddress = addrInput;
				if (alsoUseSelectedAddressForTheOther) input.shippingAddress = addrInput;
			} else {
				input.shippingAddress = addrInput;
				if (alsoUseSelectedAddressForTheOther) input.billingAddress = addrInput;
			}

			loading = true;
			if (order.status === OrderStatus.Draft) {
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'draftOrderUpdate'>,
					MutationDraftOrderUpdateArgs
				>(DRAFT_ORDER_UPDATE_MUTATION, { id: order.id, input });
				checkIfGraphqlResultHasError(result, 'draftOrderUpdate', $CommonState.EditSuccess);
			} else {
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'orderUpdate'>,
					MutationOrderUpdateArgs
				>(ORDER_UPDATE_MUTATION, { id: order.id, input: input });
				checkIfGraphqlResultHasError(result, 'orderUpdate', $CommonState.EditSuccess);
			}
			loading = false;
		}
		currentSetAddressType = undefined;
		onRefetchOrder?.();
	};
</script>

<div class="space-y-2 w-3/10 max-tablet:w-full">
	<div class="{SitenameCommonClassName} overflow-auto">
		<SectionHeader>
			<div>Customer</div>
			{#if order.status === OrderStatus.Draft}
				<IconButton
					size="xs"
					icon={PencilMinus}
					variant="light"
					onclick={() => (enableEditCustomer = true)}
					disabled={ShouldDisable}
				/>
			{/if}
		</SectionHeader>

		{#if order.userEmail && !enableEditCustomer}
			<p class="text-sm">{order.userEmail}</p>
		{:else if enableEditCustomer && order.status === OrderStatus.Draft}
			<GraphqlPaginableSelect
				query={CUSTOMER_LIST_QUERY}
				optionLabelKey="email"
				optionValueKey="id"
				placeholder="Select customer"
				label="Specify order customer"
				disabled={ShouldDisable}
				required
				variables={{ first: 20, filter: { search: '' } } as QueryCustomersArgs}
				variableSearchQueryPath="filter.search"
				size="sm"
				resultKey="customers"
				value={order.user?.id}
				onchange={handleUpdateCustomer}
			/>
		{/if}
		{#if order.user}
			<a
				class="link text-xs text-blue-500"
				href={AppRoute.SETTINGS_CONFIGS_USER_DETAILS(order.user?.id)}
				target="_blank"
			>
				View profile
			</a>
		{/if}
		{#if order.userEmail}
			<a class="link text-xs text-blue-500" href={`mailto:${order.userEmail}`}>Send email</a>
		{/if}
	</div>

	<div class={SitenameCommonClassName}>
		<Accordion header="Shipping address">
			<div class="space-y-2">
				{#if order.shippingAddress}
					<UserAddress address={order.shippingAddress} class="w-full mb-2" />
				{:else}
					<Alert variant="info" size="sm" bordered>This order has no shipping address</Alert>
				{/if}
				<Button
					size="sm"
					fullWidth
					endIcon={PencilMinus}
					color="gray"
					onclick={() => handleClickSetAddress(AddressTypeEnum.Shipping)}
					disabled={ShouldDisable}
				>
					Set shipping address
				</Button>
			</div>
		</Accordion>

		<Accordion header="Billing address">
			<div class="space-y-2">
				{#if order.billingAddress}
					<UserAddress address={order.billingAddress} class="w-full mb-2" />
				{:else}
					<Alert variant="info" size="sm" bordered>This order has no billing address</Alert>
				{/if}
				<Button
					size="sm"
					fullWidth
					endIcon={PencilMinus}
					color="gray"
					onclick={() => handleClickSetAddress(AddressTypeEnum.Billing)}
					disabled={ShouldDisable}
				>
					Set billing address
				</Button>
			</div>
		</Accordion>
	</div>

	<div class={SitenameCommonClassName}>
		<SectionHeader>Sales channel</SectionHeader>
		<a
			class="link text-blue-500 text-sm"
			href={AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(order.channel.slug)}
		>
			<span>{order.channel.name}</span>
			<span class="text-xs">({order.channel.currencyCode})</span>
		</a>
	</div>

	{#if order.status !== OrderStatus.Draft}
		<div class={SitenameCommonClassName}>
			<SectionHeader>
				<span>Invoices</span>
				<Button size="xs" variant="light" disabled={ShouldDisable}>Generate</Button>
			</SectionHeader>
			{#if order.invoices.length}
				{#each order.invoices as invoice, idx (idx)}
					<div>{invoice.number}</div>
				{/each}
			{:else}
				<Alert size="sm" bordered>No invoice to show</Alert>
			{/if}
		</div>
	{/if}

	<div class={SitenameCommonClassName}>
		<SectionHeader>Customer note</SectionHeader>
		{#if order.customerNote}
			<TextArea readonly value={order.customerNote} disabled={ShouldDisable} />
		{:else}
			<Alert size="sm" bordered>This order has no customer note</Alert>
		{/if}
	</div>
</div>

<Modal
	size="sm"
	open={!!currentSetAddressType}
	header="Set {currentSetAddressType?.toLowerCase()} address"
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (currentSetAddressType = undefined)}
	onCancel={() => (currentSetAddressType = undefined)}
	disableElements={ShouldDisable}
	okText={$T('common.ok')}
	cancelText={$T('common.cancel')}
	onOk={handleSetUserAddresses}
>
	{#if $CustomerQuery.fetching}
		<TableSkeleton numColumns={2} />
	{:else if $CustomerQuery.error}
		<Alert size="sm" variant="error">{$CustomerQuery.error.message}</Alert>
	{:else if $CustomerQuery.data?.user}
		{#if $CustomerQuery.data.user.addresses.length}
			<div>
				{#each $CustomerQuery.data.user.addresses as address, idx (idx)}
					<label class="cursor-pointer relative" for={address.id}>
						<UserAddress {address} class="mb-2" />
						<RadioButton
							value={address.id}
							id={address.id}
							bind:group={selectedAddressId}
							checked={address.id === selectedAddressId}
							disabled={ShouldDisable}
							class="absolute right-2 top-4"
							onchange={() => address.id === selectedAddressId && (selectedAddress = address)}
						/>
					</label>
				{/each}
			</div>

			{#if selectedAddressId}
				<Checkbox
					label="Also use this address as {currentSetAddressType === AddressTypeEnum.Shipping
						? 'billing'
						: 'shipping'} address ?"
					disabled={ShouldDisable}
					bind:checked={alsoUseSelectedAddressForTheOther}
				/>
			{/if}
		{:else}
			<Alert size="md" variant="warning">This customer has no address</Alert>
		{/if}
	{/if}
</Modal>
