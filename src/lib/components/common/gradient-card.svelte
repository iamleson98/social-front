<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';

	interface Props {
		icon: string;
		name: string;
		bgFrom?: string;
		bgTo?: string;
		selected?: boolean;
		onclick: MouseEventHandler<HTMLDivElement> | null | undefined;
	}

	let { icon, name, bgFrom, bgTo, selected, onclick }: Props = $props();
</script>

<div
	class="relative flex items-center p-4 rounded-lg bg-gray-100 cursor-pointer h-30"
	role="button"
	{onclick}
>
	<div
		class={`flex items-center justify-center h-20 w-20 tablet:h-14 tablet:w-14 rounded-lg bg-gradient-to-br ${bgFrom} ${bgTo}`}
	>
		<slot name="icon"></slot>
	</div>
	<div class="ml-4 flex-1">
		<span class="text-l font-lobster text-orange-400 w-full">{name}</span>
	</div>
	{#if selected}
		<span
			class="absolute top-2 right-2 icon-[system-uicons--check-circle] w-7 h-7 bg-blue-500 text-white"
		></span>
	{/if}
</div>
