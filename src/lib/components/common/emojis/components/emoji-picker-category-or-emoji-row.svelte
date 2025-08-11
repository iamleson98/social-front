<script lang="ts">
	import type { CategoryOrEmojiRow, CustomEmoji, Emoji, EmojiCursor, SystemEmoji } from '../types';
	import { isCategoryHeaderRow } from '../utils';
	import EmojiPickerCategoryRow from './emoji-picker-category-row.svelte';
	import EmojiPickerItem from './emoji-picker-item.svelte';

	type Props = {
		cursorRowIndex: number;
		cursorEmojiId: SystemEmoji['unified'] | CustomEmoji['id'];
		onEmojiClick: (emoji: Emoji) => void;
		onEmojiMouseOver: (cursor: EmojiCursor) => void;
		data: CategoryOrEmojiRow;
		index: number;
		class?: string;
	};

	let {
		cursorEmojiId,
		cursorRowIndex,
		onEmojiClick,
		onEmojiMouseOver,
		data,
		index,
		class: className = '',
	}: Props = $props();
</script>

{#if isCategoryHeaderRow(data)}
	<EmojiPickerCategoryRow categoryName={data.items[0].categoryName} class={className} />
{:else}
	<div class={[className, 'flex justify-start pe-1.5 ps-1.5']} role="row">
		{#each data.items as emojiColumn, idx (idx)}
			<EmojiPickerItem
				emoji={emojiColumn.item}
				rowIndex={data.index}
				isSelected={emojiColumn.emojiId.toLowerCase() === cursorEmojiId.toLowerCase() &&
					cursorRowIndex === index}
				onClick={onEmojiClick}
				onMouseOver={onEmojiMouseOver}
			/>
		{/each}
	</div>
{/if}
