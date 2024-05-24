<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let selected: boolean = false;
	export let content: string = '';

	const dispatch = createEventDispatcher();

	function selectItem() {
		dispatch('select');
	}
</script>

<style>
	.item {
		border: 1px solid #E1E1E1;
		color: #718096;
		padding: 5px 15px;
		cursor: pointer;
		border-radius: 5px;
		text-align: center;
	}
	.item.selected {
		background-color: #FF5B5B;
		color: white;
        font-weight: 400;
        font-size: 14px;
	}
</style>

<div class="item {selected ? 'selected' : ''}" on:click={selectItem}>
	{content}
</div>
