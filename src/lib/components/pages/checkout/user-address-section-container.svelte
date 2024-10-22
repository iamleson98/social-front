<script lang="ts">
	import AddressCreateForm from './address-create-form.svelte';
	import AddressEditForm from './address-edit-form.svelte';
	import AddressList from './address-list.svelte';

	let displayAddressCreate = $state(false);
	let editedAddressId = $state<string>();

	let displayAddressEdit = $derived(!!editedAddressId);
	let displayAddressList = $derived.by(() => !displayAddressCreate && !displayAddressEdit);
</script>

{#if displayAddressCreate}
	<AddressCreateForm />
{/if}

{#if displayAddressEdit}
	<AddressEditForm />
{/if}

{#if displayAddressList}
	<AddressList />
{/if}
