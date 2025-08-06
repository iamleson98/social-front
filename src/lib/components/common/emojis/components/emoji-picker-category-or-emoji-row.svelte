<script lang="ts">
	import type { CustomEmoji, Emoji, EmojiCursor, SystemEmoji } from '../types';
	import { isCategoryHeaderRow } from '../utils';

	type Props = {
		cursorRowIndex: number;
		cursorEmojiId: SystemEmoji['unified'] | CustomEmoji['id'];
		onEmojiClick: (emoji: Emoji) => void;
		onEmojiMouseOver: (cursor: EmojiCursor) => void;
	};

	let { cursorEmojiId, cursorRowIndex, onEmojiClick, onEmojiMouseOver }: Props = $props();
</script>

{#if isCategoryHeaderRow(data[index])}

{/if}
