<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		class?: string;
		children: Snippet;
	};

	let { class: className = '', children }: Props = $props();
</script>

<div class={`bg-gray-50 flex-1 rounded-sm p-0.5 ${className}`}>
	{@render children()}
</div>
