<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type Props = {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { children }: Props = $props();
</script>

<div class=" pt-1 pb-1 bg-white shadow-md z-10 min-w-max rounded-md border border-slate-300">
	{#if children}
		{@render children()}
	{/if}
</div>
