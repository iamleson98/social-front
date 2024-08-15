<script lang="ts">
	import Alert from '$lib/components/common/alert.svelte';
	import { toastStore } from '$lib/stores/ui/toast';
</script>

<div class="notifications">
	{#each $toastStore as notification (notification.id)}
		<Alert
			content={notification.message}
			variant={notification.variant}
			classes="!text-lg mb-2"
		/>
	{/each}
</div>

<style lang="postcss">
	.notifications {
		@apply fixed bottom-4 z-[99999] flex flex-col justify-start pointer-events-none p-0 my-0 right-6;
	}
</style>
