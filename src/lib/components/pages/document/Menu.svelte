<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { menuItems } from '../../../../routes/document/data_content';
	import { writable } from 'svelte/store';

	const dispatch = createEventDispatcher();

	let selectedMenuId = writable<string>('table-of-contents');

	function selectItem(id: string) {
		selectedMenuId.set(id);
		dispatch('select', id);
	}
</script>

<div class="menu">
	{#each menuItems as item}
		<!-- svelte-ignore event_directive_deprecated -->
		<button
			class="w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 transition-all duration-200"
			on:click={() => selectItem(item.id)}
			class:text-blue-500={$selectedMenuId === item.id}
		>
			{item.title}
		</button>
	{/each}
</div>

<style>
</style>
