<script lang="ts">
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { AutoSizer } from '../../autosizer';
	import {
		CATEGORIES_CONTAINER_HEIGHT,
		CUSTOM_EMOJIS_PER_PAGE,
		EMOJI_CONTAINER_HEIGHT,
		EMOJI_ROWS_OVERSCAN_COUNT,
		ITEM_HEIGHT,
		type ActionResult,
		type CategoryOrEmojiRow,
		type CustomEmoji,
		type Emoji,
		type EmojiCategory,
		type EmojiCursor,
		type SystemEmoji,
	} from '../types';
	import { InfiniteLoader, LoaderState } from 'svelte-infinite';
	import EmojiPickerCategoryOrEmojiRow from './emoji-picker-category-or-emoji-row.svelte';

	interface Props {
		categoryOrEmojisRows: CategoryOrEmojiRow[];
		isFiltering: boolean;
		activeCategory: EmojiCategory;
		cursorRowIndex: number;
		cursorEmojiId: SystemEmoji['unified'] | CustomEmoji['name'];
		customEmojisEnabled: boolean;
		customEmojiPage: number;
		// setActiveCategory: (category: EmojiCategory) => void;
		onEmojiClick: (emoji: Emoji) => void;
		onEmojiMouseOver: (cursor: EmojiCursor) => void;
		incrementEmojiPickerPage: () => void;
		getCustomEmojis: (
			page?: number,
			perPage?: number,
			sort?: string,
			loadUsers?: boolean,
		) => Promise<ActionResult<CustomEmoji[]>>;
	}

	let {
		categoryOrEmojisRows,
		isFiltering,
		activeCategory = $bindable(),
		cursorRowIndex,
		cursorEmojiId,
		customEmojisEnabled,
		customEmojiPage,
		// setActiveCategory,
		onEmojiClick,
		onEmojiMouseOver,
		incrementEmojiPickerPage,
		getCustomEmojis,
	}: Props = $props();

	const loaderState = new LoaderState();
	let virtualListEl = $state<HTMLDivElement>();

	const virtualizer = $derived(
		createVirtualizer<HTMLDivElement, HTMLDivElement>({
			count: categoryOrEmojisRows.length,
			getScrollElement: () => virtualListEl!,
			estimateSize: () => ITEM_HEIGHT,
			overscan: EMOJI_ROWS_OVERSCAN_COUNT,
			horizontal: false,
		}),
	);

	const handleLoadMore = async () => {
		if (!customEmojisEnabled) {
			return;
		}

		const { data } = await getCustomEmojis(customEmojiPage, CUSTOM_EMOJIS_PER_PAGE);

		// If data came back empty, or data is less than the perPage, then we know there are no more pages
		if (!data || data.length < CUSTOM_EMOJIS_PER_PAGE) {
			return;
		}

		incrementEmojiPickerPage();
	};
</script>

<div
	class="emoji-picker__items"
	style="height: {isFiltering
		? EMOJI_CONTAINER_HEIGHT + CATEGORIES_CONTAINER_HEIGHT
		: EMOJI_CONTAINER_HEIGHT}px;"
>
	<div
		class="emoji-picker__container"
		role="grid"
		aria-labelledby="emojiPickerSearch"
		bind:this={virtualListEl}
	>
		<AutoSizer>
			<InfiniteLoader {loaderState} triggerLoad={handleLoadMore}>
				{#each $virtualizer.getVirtualItems() as item (item.index)}
					<EmojiPickerCategoryOrEmojiRow
						index={item.index}
						data={categoryOrEmojisRows}
						{cursorRowIndex}
						{cursorEmojiId}
						{onEmojiClick}
						{onEmojiMouseOver}
					/>
				{/each}
			</InfiniteLoader>
		</AutoSizer>
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.emoji-picker__items {
		@apply relative border-t border-solid overflow-y-auto overflow-x-hidden;
	}

	.emoji-picker__items:has(.no-results__wrapper) {
		@apply flex items-center justify-center p-0;
	}

	.emoji-picker__items.gif-picker__items {
		@apply flex justify-center px-3 pt-3 pb-0 h-96;
	}

	.emoji-picker__container {
		@apply relative min-w-80 min-h-full;
	}

	.emoji-picker__category-header {
		@apply relative content-center text-xs font-bold leading-normal uppercase text-gray-600;
	}

	.emoji-picker__preview_sprite {
		@apply inline-block h-12 p-1 m-1 align-top;
	}
</style>
