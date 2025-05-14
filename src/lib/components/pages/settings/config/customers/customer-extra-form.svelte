<script lang="ts">
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { type Address } from '$lib/gql/graphql';
	import dayjs from 'dayjs';

	type Props = {
		addresses: Address[];
		lastLoginTime: string;
		lastOrderAt: string;
	};

	let { addresses, lastLoginTime, lastOrderAt }: Props = $props();

	const formatDateLabel = (label: string, date: Date | string | undefined) =>
		`${label}: ${date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '—'}`;
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3 pb-6 flex flex-col gap-3 flex-1 w-4/10">
	<Accordion header="Address information">
		{#if addresses.length > 0}
			{#each addresses as address, idx (idx)}
				<UserAddress {address} class="w-full mb-3" />
			{/each}
		{:else}
			<span class="text-gray-500 text-sm">This customer has no address</span>
		{/if}
	</Accordion>

	<Accordion header="Customer history">
		<div class="flex flex-col gap-2">
			<span>{formatDateLabel('Last login', lastLoginTime)}</span>
			<span>{formatDateLabel('Last order', lastOrderAt)}</span>
		</div>
	</Accordion>
</div>
