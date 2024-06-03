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
	class="border border-gray-300 text-gray-400 w-full py-[3px] cursor-pointer rounded text-center {selected
		? 'bg-red-400 text-white font-normal border-red-400'
		: ''}"
	on:click={selectItem}
>
	{content}
</div>
