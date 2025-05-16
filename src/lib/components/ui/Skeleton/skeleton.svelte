<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		/** tailwind classes. E.g `w-5 h-5` */
		class: string;
		rounded?: boolean;
		children?: Snippet;
	};

	let { class: className, rounded = false, children }: Props = $props();
</script>

<div class={`bg-gray-300 ${className} animate-pulse ${rounded ? 'rounded-full' : 'rounded-md'}`}>
	{@render children?.()}
</div>
