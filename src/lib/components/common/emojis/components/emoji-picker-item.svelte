<script lang="ts">
	import type { Emoji, EmojiCursor } from '../types';
	import { getEmojiImageUrl, isSystemEmoji } from '../utils';
	import imgTrans from './img_trans.gif';

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
	class={['emoji-picker-item', isSelected && 'selected bg-gray-200!']}
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

	.emojisprite {
		@apply w-[66px] h-[66px] max-w-none rounded-2xl bg-no-repeat transition-transform duration-200 ease-in-out scale-40;
	}

	.emoji-picker-item {
		@apply relative inline-flex overflow-hidden w-[36px] h-[36px] items-center justify-center border-none! outline-none! rounded-sm cursor-pointer align-middle hover:bg-gray-200 active:bg-gray-300;
	}

	.emoji-picker-item.selected img,
	.emoji-picker-item:hover img {
		@apply scale-48;
	}

	.emoji-picker-item.selected img.emoji-category--custom,
	.emoji-picker-item:hover img.emoji-category--custom {
		@apply scale-100;
	}

	.emoji-picker-item img {
		@apply relative transition-all duration-200 ease-in-out;
	}

	.emoji-picker-item img.emoji-category--custom {
		@apply top-auto left-auto w-auto max-w-[22px] h-auto max-h-[22px];
	}
</style>
