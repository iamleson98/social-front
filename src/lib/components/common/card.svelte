<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		cardTitle: string;
		children: Snippet;
	}

	let { cardTitle, children }: Props = $props();
</script>

<div class="card">
	<div class="card-body">
		<div class="card-title">
			{cardTitle}
		</div>
		<div>
			{@render children()}
		</div>
	</div>
</div>
