<script lang="ts">
	import { alertStore } from '$lib/stores/ui/alert-modal';
	import AlertModal from './alert-modal.svelte';
</script>

<AlertModal open={!!$alertStore} onCancel={$alertStore?.onCancel} onOk={$alertStore?.onOk}>
	{#if $alertStore}
		{#if typeof $alertStore.content === 'string'}
			{$alertStore.content}
		{:else}
			{@render $alertStore.content()}
		{/if}
	{/if}
</AlertModal>
