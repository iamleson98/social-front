<script lang="ts">
	import { Alert } from '$lib/components/ui/Alert';
	import { toastStore } from '$lib/stores/ui/toast';
</script>

<div class="fixed bottom-4 z-99999 flex flex-col justify-start pointer-events-none p-0 my-0 right-6">
	{#each $toastStore as notification (notification.id)}
		<Alert variant={notification.variant} class="mb-2 shadow-lg" bordered size="md">
			{notification.message}
		</Alert>
	{/each}
</div>
