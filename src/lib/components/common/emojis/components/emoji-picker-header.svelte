<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';

	type Props = {
		handleEmojiPickerClose: MouseEventHandler<HTMLButtonElement>;
	};

	let { handleEmojiPickerClose }: Props = $props();
</script>

<div class="top-0 hidden w-full py-3 pr-2.5 pl-3.5 bg-gray-100 text-gray-400">
	<button
		class="w-7.5 h-7.5 bg-transparent text-gray-400 opacity-100 hover:bg-gray-300"
		onclick={handleEmojiPickerClose}
	>
		<h4>Emoji picker</h4>
	</button>
</div>
