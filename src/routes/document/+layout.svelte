<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<div>
	<a href="/project-structure">project structure</a>
	<a href="/project-structure">project structure</a>
	<a href="/project-structure">project structure</a>
	<a href="/project-structure">project structure</a>
	<a href="/project-structure">project structure</a>
	<a href="/break-point">break point</a>
</div>

<div>
	{@render children()}
</div>
