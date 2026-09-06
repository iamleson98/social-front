<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className = '' }: Props = $props();
</script>

<!--
	Design System v2 (admin): section headers are quiet separators — a
	semi-bold dark label over a hairline divider, with room for trailing
	actions on the right (justify-between).
-->
<div
	class="outer mb-3 flex items-center w-full! justify-between gap-2 border-b border-gray-100 pb-2 {className}"
>
	{@render children()}
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.outer,
	.outer > * {
		@apply font-semibold text-gray-900 text-sm;
	}
</style>
