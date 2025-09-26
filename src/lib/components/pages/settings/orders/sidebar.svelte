<script lang="ts">
	import { CUSTOMER_LIST_QUERY, USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, RadioButton, TextArea } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import {
		AddressTypeEnum,
		OrderStatus,
		type Address,
		type AddressInput,
		type Order,
		type Query,
		type QueryCustomersArgs,
		type QueryUserArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { convertAddressToAddressInput, SitenameCommonClassName } from '$lib/utils/utils';

	type Props = {
		order: Order;
		onDoneCustomerUpdate?: () => void;
		handleUpdateCustomer: (id: string) => void;
		disabled?: boolean;
		setAddress: (type: AddressTypeEnum, addr: AddressInput, alsoSetForTheRest: boolean) => void;
	};

	let { order, handleUpdateCustomer, disabled, setAddress }: Props = $props();

	let currentSetAddressType = $state<AddressTypeEnum>();
	let alsoSetSeLectedAddressAsTheRest = $state(false);
	let selectedAddress = $state<Address>();
	let selectedAddressId = $state<string>();

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
</script>

<div class="space-y-2 w-3/10">
	<div class={SitenameCommonClassName}>
		<SectionHeader>Customer</SectionHeader>
		{#if order.status === OrderStatus.Draft}
			<GraphqlPaginableSelect
				query={CUSTOMER_LIST_QUERY}
				optionLabelKey="email"
				{disabled}
				optionValueKey="id"
				placeholder="Select customer"
				label="Specify order customer"
				required
				variables={{ first: 20, filter: { search: '' } } as QueryCustomersArgs}
				variableSearchQueryPath="filter.search"
				size="sm"
				resultKey="customers"
				value={order.user?.id}
				onchange={(opt) =>
					opt &&
					(opt as SelectOption).value !== order.user?.id &&
					handleUpdateCustomer((opt as SelectOption).value as string)}
			/>
		{:else if order.userEmail}
			<p class="text-sm">{order.userEmail}</p>
		{/if}
		{#if order.user}
			<a
				class="link text-xs text-blue-500 block"
				href={AppRoute.SETTINGS_CONFIGS_USER_DETAILS(order.user?.id)}
			>
				View profile
			</a>
		{/if}
		{#if order.userEmail}
			<a class="link text-xs text-blue-500 block" href={`mailto:${order.userEmail}`}>Send email</a>
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
					size="xs"
					fullWidth
					endIcon={Plus}
					color="gray"
					onclick={() => handleClickSetAddress(AddressTypeEnum.Shipping)}
					>Set shipping address</Button
				>
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
					size="xs"
					fullWidth
					endIcon={Plus}
					color="gray"
					onclick={() => handleClickSetAddress(AddressTypeEnum.Billing)}>Set billing address</Button
				>
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

	<div class={SitenameCommonClassName}>
		<SectionHeader>
			<span>Invoices</span>
			<Button size="xs" variant="light">Generate</Button>
		</SectionHeader>
		{#if order.invoices.length}
			{#each order.invoices as invoice, idx (idx)}
				<div>{invoice.number}</div>
			{/each}
		{:else}
			<Alert size="sm" bordered>No invoice to show</Alert>
		{/if}
	</div>

	<div class={SitenameCommonClassName}>
		<SectionHeader>Customer note</SectionHeader>
		{#if order.customerNote}
			<TextArea readonly value={order.customerNote} />
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
	disableElements={disabled}
	onOk={() => {
		if (selectedAddress) {
			setAddress(
				currentSetAddressType!,
				convertAddressToAddressInput(selectedAddress),
				alsoSetSeLectedAddressAsTheRest,
			);
		}
	}}
>
	{#if $CustomerQuery.fetching}
		<TableSkeleton numColumns={2} />
	{:else if $CustomerQuery.error}
		<Alert size="sm" variant="error">{$CustomerQuery.error.message}</Alert>
	{:else if $CustomerQuery.data?.user}
		{#if $CustomerQuery.data.user.addresses.length}
			<div class="mb-2">
				{#each $CustomerQuery.data.user.addresses as address, idx (idx)}
					<label class="cursor-pointer my-1" for={address.id}>
						<UserAddress {address} class="relative">
							<RadioButton
								value={address.id}
								bind:group={selectedAddressId}
								checked={address.id === selectedAddressId}
								{disabled}
								class="absolute right-2 top-4"
								onchange={() => address.id === selectedAddressId && (selectedAddress = address)}
							/>
						</UserAddress>
					</label>
				{/each}
			</div>

			{#if selectedAddressId}
				<Checkbox
					label="Also use this address as {currentSetAddressType === AddressTypeEnum.Shipping
						? 'billing'
						: 'shipping'} address ?"
					{disabled}
					bind:checked={alsoSetSeLectedAddressAsTheRest}
				/>
			{/if}
		{:else}
			<Alert size="md" variant="warning">This customer has no address</Alert>
		{/if}
	{/if}
</Modal>
