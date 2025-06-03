<script lang="ts">
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Address } from '$lib/gql/graphql';

	type Props = {
		shippingAddresses: Address[];
		billingAddress: Address[];
	};

	let { shippingAddresses, billingAddress }: Props = $props();
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3">
	<Accordion header="Shipping address">
		{#if shippingAddresses.length}
			{#each shippingAddresses as address, idx (idx)}
				<UserAddress {address} class="w-full mb-2" />
			{/each}
		{:else}
			<Alert variant="info" size="sm" bordered>This customer has no address</Alert>
		{/if}
	</Accordion>

	<Accordion header="Billing address" class="mt-5">
		{#if billingAddress.length}
			{#each billingAddress as address, idx (idx)}
				<UserAddress {address} class="w-full mb-2" />
			{/each}
		{:else}
			<Alert variant="info" size="sm" bordered>This customer has no address</Alert>
		{/if}
	</Accordion>
</div>
