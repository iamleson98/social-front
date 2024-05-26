<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let selected: boolean = false;
	export let content: string = '';

	const dispatch = createEventDispatcher();

	function selectItem() {
		dispatch('select');
	}
</script>

<div
	class="border border-gray-300 text-gray-600 px-4 py-1.5 cursor-pointer rounded text-center {selected ? 'bg-red-500 text-white font-normal text-sm' : ''}" 
	on:click={selectItem}>
	{content}
</div>

