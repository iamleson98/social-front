<script lang="ts">
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Button } from '$lib/components/ui';
	import { userStore } from '$lib/stores/auth';

	type Props = {
		onEditChange: (addressId: string) => void;
		onAddAddressClick: () => void;
	};

	let { onEditChange, onAddAddressClick }: Props = $props();
</script>

{#if $userStore}
	{#if $userStore.addresses.length}
		{#each $userStore.addresses as address, idx (idx)}
			<UserAddress {address}>
				<Button size="xs" color="blue" onclick={() => onEditChange(address.id)}>Edit</Button>
			</UserAddress>
		{/each}
	{:else}
		<p class="text-sm">You have no address yet</p>
	{/if}
{/if}

<div class="flex justify-end">
	<Button size="xs" class="mt-2 inline" color="green" onclick={onAddAddressClick}
		>Add new address</Button
	>
</div>
