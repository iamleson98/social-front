<script lang="ts">
	import { createVirtualizer, type SvelteVirtualizer } from '@tanstack/svelte-virtual';
	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';

	let virtualListEl = $state<HTMLDivElement>();
	let virtualizer = $state<Readable<SvelteVirtualizer<HTMLDivElement, HTMLDivElement>>>();

	onMount(() => {
		virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
			count: 10000,
			getScrollElement: () => virtualListEl!,
			estimateSize: () => 30,
			overscan: 5,
			horizontal: false,
		});
	});
</script>

<div class="list scroll-container bg-red-200" bind:this={virtualListEl}>
	<div style="position: relative; height: {$virtualizer?.getTotalSize()}px; width: 100%;">
		{#each $virtualizer?.getVirtualItems() || [] as row (row.index)}
			<div
				class:list-item-even={row.index % 2 === 0}
				class:list-item-odd={row.index % 2 === 1}
				style="position: absolute; top: 0; left: 0; width: 100%; height: {row.size}px; transform: translateY({row.start}px);"
			>
				Row {row.size}/ {row.start}
			</div>
		{/each}
	</div>
</div>

<style>
	.scroll-container {
		height: 200px;
		width: 400px;
		overflow: auto;
	}
</style>
