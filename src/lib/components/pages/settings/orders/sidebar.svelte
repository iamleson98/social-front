<script lang="ts">
	import { CUSTOMER_LIST_QUERY, USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { operationStore, type OperationResultState } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { TextArea } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import {
		OrderStatus,
		type Address,
		type Mutation,
		type MutationDraftOrderUpdateArgs,
		type Order,
		type Query,
		type QueryCustomersArgs,
		type QueryUserArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import UserAddressOrder from './user-address-order.svelte';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { DRAFT_ORDER_UPDATE_MUTATION } from '$lib/api/admin/orders';
	import { checkIfGraphqlResultHasError, convertAddressToAddressInput } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	type Props = {
		order: Order;
		onDoneCustomerUpdate?: () => void;
	};

	let { order, onDoneCustomerUpdate }: Props = $props();

	let customerId = $state('');
	let loading = $state(false);

	const customerQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
		query: USER_DETAIL_QUERY,
		variables: {},
		pause: true,
	});

	let shippingAddress = $state<Address | null | undefined>(order.shippingAddress);
	let billingAddress = $state<Address | null | undefined>(order.billingAddress);

	const handleUpdateCustomerAndAddressForOrder = async (
		queryResult: OperationResultState<Pick<Query, 'user'>, QueryUserArgs>,
	) => {
		if (!queryResult.data?.user) return;

		const { addresses } = queryResult.data.user;
		shippingAddress = addresses.find((addr) => addr.isDefaultShippingAddress) || addresses[0];
		billingAddress = addresses.find((addr) => addr.isDefaultBillingAddress) || addresses[0];

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'draftOrderUpdate'>,
			MutationDraftOrderUpdateArgs
		>(DRAFT_ORDER_UPDATE_MUTATION, {
			id: order.id,
			input: {
				user: customerId,
				shippingAddress: shippingAddress ? convertAddressToAddressInput(shippingAddress) : null,
				billingAddress: billingAddress ? convertAddressToAddressInput(billingAddress) : null,
			},
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'draftOrderUpdate',
				'Successfully updated customer for darft order',
			)
		)
			return;

		onDoneCustomerUpdate?.();
	};

	const handleCustomerChange = async () => {
		if (!customerId) return;

		// fetch customer detail for showing addresses
		customerQuery.reexecute({
			variables: {
				id: customerId,
			},
			context: { requestPolicy: 'network-only' },
		});
	};

	onMount(() => customerQuery.subscribe(handleUpdateCustomerAndAddressForOrder));
</script>

<div class="space-y-2 w-3/10">
	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<SectionHeader>Customer</SectionHeader>
		{#if order.status === OrderStatus.Draft}
			<GraphqlPaginableSelect
				query={CUSTOMER_LIST_QUERY}
				optionLabelKey="email"
				optionValueKey="id"
				placeholder="Select customer"
				label="Specify order customer"
				required
				variables={{ first: 20, filter: { search: '' } } as QueryCustomersArgs}
				variableSearchQueryPath="filter.search"
				size="sm"
				resultKey="customers"
				bind:value={customerId}
				onchange={handleCustomerChange}
			/>
		{:else if order.userEmail}
			<p class="text-sm">{order.userEmail}</p>
		{/if}
		{#if order.user}
			<a
				class="link text-sm text-blue-500"
				href={AppRoute.SETTINGS_CONFIGS_USER_DETAILS(order.user?.id)}
			>
				View profile
			</a>
		{/if}
	</div>

	<UserAddressOrder {shippingAddress} {billingAddress} />

	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<SectionHeader>Sales channel</SectionHeader>
		<a
			class="link text-blue-500 text-sm"
			href={AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(order.channel.slug)}
		>
			<span>{order.channel.name}</span>
			<span class="text-xs">({order.channel.currencyCode})</span>
		</a>
	</div>

	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<SectionHeader>
			<span>Invoices</span>
			<Button size="xs" variant="light">Generate</Button>
		</SectionHeader>
		{#if order.invoices.length}
			{#each order.invoices as invoice, idx (idx)}
				<div>{invoice.number}</div>
			{/each}
		{:else}
			<Alert size="xs" bordered>No invoice to show</Alert>
		{/if}
	</div>

	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<SectionHeader>Customer note</SectionHeader>
		{#if order.customerNote}
			<TextArea readonly value={order.customerNote} />
		{:else}
			<Alert size="xs" bordered>This order has no customer note</Alert>
		{/if}
	</div>
</div>
