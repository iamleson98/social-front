<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		class: string;
		children: Snippet;
	};

	let { class: className, children }: Props = $props();
</script>

<div class={`bg-gray-50 rounded p-2 ${className}`}>
	{@render children()}
</div>
