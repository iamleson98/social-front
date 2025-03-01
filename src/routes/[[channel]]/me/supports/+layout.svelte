<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<div role="tablist" class="tabs tabs-border">
	<a role="tab" class="tab tab-active">My Tickets</a>
	<a role="tab" class="tab">Create New Support ticket</a>
	<a role="tab" class="tab">Tab 3</a>
</div>

<div>
	{@render children()}
</div>
