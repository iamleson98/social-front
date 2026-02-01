<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className = '' }: Props = $props();
</script>

<div class="outer mb-2 flex items-center w-full! justify-between {className}">
	{@render children()}
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.outer,	.outer > * {
		@apply font-semibold text-gray-700 text-base;
	}
</style>
