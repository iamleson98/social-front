<script lang="ts">
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { Alert } from '../Alert';
	import AlertModal from './alert-modal.svelte';
</script>

<AlertModal
	open={!!$ALERT_MODAL_STORE}
	onCancel={$ALERT_MODAL_STORE?.onCancel}
	onOk={$ALERT_MODAL_STORE?.onOk}
	variant={$ALERT_MODAL_STORE?.variant}
>
	{#if $ALERT_MODAL_STORE}
		<Alert variant={$ALERT_MODAL_STORE?.variant}>
			{#if typeof $ALERT_MODAL_STORE.content === 'string'}
				{$ALERT_MODAL_STORE.content}
			{:else}
				{@render $ALERT_MODAL_STORE.content()}
			{/if}
		</Alert>
	{/if}
</AlertModal>
