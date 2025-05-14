<script lang="ts">
	import { tranFunc } from '$i18n';
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Edit, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { type Address } from '$lib/gql/graphql';
	import dayjs from 'dayjs';

	type Props = {
		addresses: Address[];
		lastLogin: string;
		lastOrder: string;
	};

	let { addresses, lastLogin, lastOrder }: Props = $props();
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3 pb-6 flex flex-col gap-3 flex-1 w-4/10">
	<Accordion header="Address information">
		{#if addresses.length > 0}
			{#each addresses as address, idx (idx)}
				<UserAddress {address} class="w-full mb-3">
					<div class="text-right flex gap-2 justify-end mt-2">
						<Button size="xs" variant="light" startIcon={Edit}>{$tranFunc('btn.update')}</Button>
						<Button size="xs" color="red" variant="light" startIcon={Trash}
							>{$tranFunc('btn.delete')}</Button
						>
					</div>
				</UserAddress>
			{/each}
		{:else}
			<span class="text-gray-500 text-sm">No addresses</span>
		{/if}
	</Accordion>

	<Accordion header="Customer history">
		<div class="flex flex-col gap-2">
			<span>Last login: {dayjs(lastLogin).format('DD/MM/YYYY HH:mm')}</span>
			<span>Last order: {dayjs(lastOrder).format('DD/MM/YYYY HH:mm')}</span>
		</div>
	</Accordion>
</div>
