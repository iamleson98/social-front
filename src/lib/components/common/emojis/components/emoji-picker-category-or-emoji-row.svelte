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
		data: CategoryOrEmojiRow[];
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

	const row = data[index];
</script>

{#if isCategoryHeaderRow(row)}
	<EmojiPickerCategoryRow categoryName={row.items[0].categoryName} class={className} />
{:else}
	<div class={[className, 'flex justify-start pe-1 ps-3']} role="row">
		{#each row.items as emojiColumn, idx (idx)}
			<EmojiPickerItem
				emoji={emojiColumn.item}
				rowIndex={row.index}
				isSelected={emojiColumn.emojiId.toLowerCase() === cursorEmojiId.toLowerCase() &&
					cursorRowIndex === index}
				onClick={onEmojiClick}
				onMouseOver={onEmojiMouseOver}
			/>
		{/each}
	</div>
{/if}
