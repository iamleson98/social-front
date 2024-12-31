<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type Props = {
		onClick?: () => void;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { onClick, children }: Props = $props();
</script>

<div
	class="py-1.5 px-3 cursor-pointer text-gray-700 hover:text-black hover:bg-slate-200"
	onclick={onClick}
>
	{#if children}
		{@render children()}
	{/if}
</div>
