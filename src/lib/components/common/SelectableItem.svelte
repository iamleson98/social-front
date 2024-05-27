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
	class="border border-custom-border-color text-custom-text-color px-4 py-1.5 cursor-pointer rounded text-center {selected ? 'bg-custom-red text-white font-normal border-custom-red' : ''}"
	on:click={selectItem}>
	{content}
</div>

