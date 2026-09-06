<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		cardTitle: string;
		children: Snippet;
	}

	let { cardTitle, children }: Props = $props();
</script>

<div class="card-surface mt-3">
	<div class="p-4 max-tablet:p-3">
		<div class="card-title text-gray-900 font-semibold mb-2">
			{cardTitle}
		</div>
		<div>
			{@render children()}
		</div>
	</div>
</div>
