<script lang="ts">
	import { tranFunc } from '$i18n';
	import { CUSTOMER_LIST_QUERY, USER_DETAIL_QUERY } from '$lib/api/admin/users';
	import { operationStore } from '$lib/api/operation';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { GraphqlPaginableSelect, SelectSkeleton } from '$lib/components/ui/select';
	import { type Query, type QueryCustomersArgs, type QueryUserArgs } from '$lib/gql/graphql';

	type Props = {
		channelSlug: string;
		showChannelNotSetError?: boolean;
	};

	let { channelSlug = $bindable(), showChannelNotSetError }: Props = $props();

	const CHANNEL_REQUIRE_ERR = $tranFunc('helpText.fieldRequired');

	let customerId = $state('');

	const customerQuery = operationStore<Pick<Query, 'user'>, QueryUserArgs>({
		kind: 'query',
		query: USER_DETAIL_QUERY,
		variables: {},
		pause: true,
	});

	$effect(() => {
		if (!!customerId) {
			customerQuery.reexecute({
				variables: {
					id: customerId,
				},
				context: { requestPolicy: 'network-only' },
			});
		}
	});
</script>

<div class="w-3/10 space-y-2">
	<div class="rounded-lg border border-gray-200 bg-white p-3">
		<SectionHeader>Channel</SectionHeader>

		<ChannelSelect
			required
			placeholder="Select channel"
			size="sm"
			label="Specify channel of order"
			valueType="slug"
			variant={!channelSlug && showChannelNotSetError ? 'error' : 'info'}
			subText={!channelSlug && showChannelNotSetError ? CHANNEL_REQUIRE_ERR : undefined}
			bind:value={channelSlug}
		/>
	</div>

	<div class="rounded-lg border border-gray-200 bg-white p-3">
		<SectionHeader>Customer</SectionHeader>

		<GraphqlPaginableSelect
			query={CUSTOMER_LIST_QUERY}
			resultKey="customers"
			optionLabelKey="email"
			optionValueKey="id"
			variables={{ first: 20, filter: { search: '' } } as QueryCustomersArgs}
			variableSearchQueryPath="filter.search"
			size="sm"
			required
			placeholder="Select customer"
			label="Select customer"
			bind:value={customerId}
		/>
	</div>

	<Accordion header="Addresses" class="bg-white rounded-lg border border-gray-200 p-3">
		<div class="space-y-2">
			{#if !customerId}
				<SectionHeader>Shipping address</SectionHeader>
				<Alert variant="warning" size="xs" bordered>No shipping address provided</Alert>
				<SectionHeader>Billing address</SectionHeader>
				<Alert variant="warning" size="xs" bordered>No billing address provided</Alert>
			{:else if $customerQuery.fetching}
				<SelectSkeleton label size="sm" />
				<SelectSkeleton label size="sm" />
			{:else if $customerQuery.error}
				<Alert size="sm" bordered variant="error">{$customerQuery.error.message}</Alert>
			{:else if $customerQuery.data?.user}
				{@const { addresses } = $customerQuery.data.user}
				{@const defaultShippingAddress =
					addresses.find((item) => item.isDefaultShippingAddress) ?? addresses[0]}
				{@const defaultBillingAddress =
					addresses.find((item) => item.isDefaultBillingAddress) ?? addresses[0]}

				<SectionHeader>Shipping address</SectionHeader>
				{#if defaultShippingAddress}
					<UserAddress address={defaultShippingAddress} />
				{:else}
					<Alert variant="warning" size="xs" bordered>No shipping address provided</Alert>
				{/if}

				<SectionHeader>Billing address</SectionHeader>
				{#if defaultBillingAddress}
					<UserAddress address={defaultBillingAddress} />
				{:else}
					<Alert variant="warning" size="xs" bordered>No billing address provided</Alert>
				{/if}
			{/if}
		</div>
	</Accordion>
</div>
