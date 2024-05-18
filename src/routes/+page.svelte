<script lang="ts">
	// import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { toastStore } from '$lib/stores/ui/toast';

	export let data: PageData;

	if (data.error) {
		toastStore.send({
			message: data.error,
			variant: 'error'
		});
	}
</script>

<svelte:head>
	<title>Sitename</title>
</svelte:head>

<div>
	{#if data.data?.edges.length}
		{#each data.data.edges as productEdge, idx (idx)}
			<div class="w-[500px] rounded p-2">
				<p>
					{productEdge.node.name}
				</p>
				<p>
					{productEdge.node.description}
				</p>
			</div>
		{/each}
	{/if}
</div>
