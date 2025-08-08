<script lang="ts">
	import type { Emoji, EmojiCursor } from '../types';
	import { getEmojiImageUrl, isSystemEmoji } from '../utils';
	import imgTrans from 'images/img_trans.gif';
	import './item-styles.css';

	type Props = {
		emoji: Emoji;
		rowIndex: number;
		isSelected?: boolean;
		onClick: (emoji: Emoji) => void;
		onMouseOver: (cursor: EmojiCursor) => void;
	};

	let { emoji, rowIndex, isSelected, onClick, onMouseOver }: Props = $props();

	const handleMouseEnter = () => {
		if (!isSelected) {
			const emojiId = isSystemEmoji(emoji) ? emoji.unified : emoji.id;
			onMouseOver({ rowIndex, emojiId, emoji });
		}
	};
</script>

<button
	class={['emoji-picker-item', isSelected && 'selected']}
	id={emoji.name.toLocaleLowerCase().replaceAll(' ', '_')}
	aria-label={isSystemEmoji(emoji) ? emoji.short_name : emoji.name}
	onclick={() => onClick(emoji)}
	onmouseenter={handleMouseEnter}
>
	{#if isSystemEmoji(emoji)}
		{@const emojiUnified = (emoji.unified || emoji.name).toLowerCase()}
		<img
			alt="{emoji.name.toLocaleLowerCase()} emoji"
			data-testid={emoji.short_names}
			src={imgTrans}
			class={`emojisprite emoji-category-${emoji.category} emoji-${emojiUnified}`}
			id={`emoji-${emojiUnified}`}
		/>
	{:else}
		<img
			alt="custom emoji"
			data-testid={emoji.name}
			src={getEmojiImageUrl(emoji)}
			class="emoji-category--custom"
		/>
	{/if}
</button>

<style lang="postcss">
	@reference "tailwindcss";

	.emoji-picker-item {
		@apply relative inline-flex overflow-hidden w-9 h-9 items-center justify-center border-none! outline-none! rounded-sm bg-transparent cursor-pointer align-middle hover:bg-gray-400 hover:scale-45;
	}

	.emoji-picker-item.selected img,
	.emoji-picker-item:hover img {
		-moz-transform: scale(0.45);
		transform: scale(0.45);

		@supports (zoom: 0.45) {
			-moz-transform: none;
			transform: none;
			zoom: 0.45;
		}
	}

	.emoji-picker-item.selected img.emoji-category--custom,
	.emoji-picker-item:hover img.emoji-category--custom {
		-moz-transform: scale(1);
		transform: scale(1);

		@supports (zoom: 1) {
			-moz-transform: none;
			transform: none;
			zoom: 1;
		}
	}

	.emoji-picker-item:active {
	}

	.emoji-picker-item img {
		@apply relative transition-transform duration-200 ease-in-out;
	}

	.emoji-picker-item img.emoji-category--custom {
		@apply top-auto left-auto w-auto max-w-[22px] h-auto max-h-[22px];
	}
</style>
