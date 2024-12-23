<script lang="ts">
	import Menu from '$lib/components/pages/document/Menu.svelte';
	import Content from '$lib/components/pages/document/Content.svelte';
	import { selectedId } from './data_content';

	let idDoc = $state('project-structure');
	function handleSelect(event: CustomEvent) {
		selectedId.set(event.detail);
		idDoc = event.detail;
	}
</script>

<div class="flex mt-12 h-[calc(100vh-90px)] py-2 pr-2 bg-white">
	<div
		class="flex-none w-1/4 overflow-y-auto border-r border-gray-300 pl-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
	>
		<Menu on:select={handleSelect} />
	</div>

	<div
		class="flex-grow overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200"
		style="background-color: #1e1e1e;"
	>
		<Content {idDoc} />
	</div>
</div>

<style>
	::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}
	::-webkit-scrollbar-thumb {
		background-color: #bababa;
		border-radius: 4px;
	}
	::-webkit-scrollbar-thumb:hover {
		background-color: #dde5eb;
	}
	::-webkit-scrollbar-track {
		background-color: #f0f0f0;
	}
</style>
