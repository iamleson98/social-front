<script lang="ts">
	import { AlertModalStore } from '$lib/stores/ui/alert-modal';
	import AlertModal from './alert-modal.svelte';
</script>

<AlertModal
	open={!!$AlertModalStore}
	onCancel={$AlertModalStore?.onCancel}
	onOk={$AlertModalStore?.onOk}
	variant={$AlertModalStore?.variant}
>
	{#if $AlertModalStore}
		{#if typeof $AlertModalStore.content === 'string'}
			{$AlertModalStore.content}
		{:else}
			{@render $AlertModalStore.content()}
		{/if}
	{/if}
</AlertModal>
