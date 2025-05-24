<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		class?: string;
	};
	let { children, class: className = '' }: Props = $props();
</script>

<div class="font-semibold text-gray-700 text-base mb-2 {className}">
	{@render children()}
</div>
