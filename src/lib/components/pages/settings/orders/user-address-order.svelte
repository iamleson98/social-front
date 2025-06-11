<script lang="ts">
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Address } from '$lib/gql/graphql';

	type Props = {
		shippingAddress: Address;
		billingAddress: Address;
	};

	let { shippingAddress, billingAddress }: Props = $props();
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3">
	<Accordion header="Shipping address">
		{#if shippingAddress}
			<UserAddress address={shippingAddress} class="w-full mb-2" />
		{:else}
			<Alert variant="info" size="sm" bordered>This customer has no shipping address</Alert>
		{/if}
	</Accordion>

	<Accordion header="Billing address" class="mt-5">
		{#if billingAddress}
			<UserAddress address={billingAddress} class="w-full mb-2" />
		{:else}
			<Alert variant="info" size="sm" bordered>This customer has no billing address</Alert>
		{/if}
	</Accordion>
</div>
