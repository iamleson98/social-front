<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		class?: string;
	};
	let { children, class: className = '' }: Props = $props();
</script>

<div
	class="container mb-2 flex items-center justify-between {className}"
>
	{@render children()}
</div>

<style lang="postcss">
	@refernce "tailwindcss";

	.container > * {
		@apply font-semibold text-gray-700 text-base;
	}
</style>
