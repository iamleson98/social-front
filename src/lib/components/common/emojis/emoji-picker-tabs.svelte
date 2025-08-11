<script lang="ts">
	import EmojiPicker from './emoji-picker.svelte';
	import type { Emoji } from './types';

	interface Props {
		onEmojiClose: () => void;
		onEmojiClick: (emoji: Emoji) => void;
		onGifClick?: (gif: string) => void;
		onAddCustomEmojiClick?: () => void;
		enableGifPicker?: boolean;
	}

	let { onEmojiClose, onEmojiClick, onGifClick, onAddCustomEmojiClick, enableGifPicker }: Props =
		$props();

	let filter = $state('');
</script>

<div
	class="w-[350px] border border-gray-200 rounded-lg mr-1 bg-white shadow-sm select-none"
	role="dialog"
	aria-modal="true"
	id="emojiPicker"
	aria-label="Emoji Picker"
>
	<EmojiPicker bind:filter {onEmojiClick} {onAddCustomEmojiClick} />
</div>
