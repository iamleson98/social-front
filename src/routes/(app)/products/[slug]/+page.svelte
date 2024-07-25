<script lang="ts">
	import Card from '$lib/components/common/card.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Card cardTitle="Product Description">
	{#if data.description.length}
		<div class="text-gray-700">
			{#each data.description as paragraph, index (index)}
				<div>{@html paragraph}</div>
			{/each}
		</div>
	{:else}
		<p>No descrirption</p>
	{/if}
</Card>
