<script lang="ts">
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Address } from '$lib/gql/graphql';

	type Props = {
		addresses: Address[];
		billingAddress: Address[];
	};

	let { addresses, billingAddress }: Props = $props();
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3">
	<Accordion header="Address information">
		{#if addresses.length}
			{#each addresses as address, idx (idx)}
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
