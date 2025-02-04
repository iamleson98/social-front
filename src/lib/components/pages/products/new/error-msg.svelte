<script lang="ts">
	import { fly } from 'svelte/transition';

	type Props = {
		error?: string;
	};

	let { error }: Props = $props();
</script>

{#if error}
	<div class="text-sm text-red-500 text-right" transition:fly={{ y: 10 }}>{error}</div>
{/if}
