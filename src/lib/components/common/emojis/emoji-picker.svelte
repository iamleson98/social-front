<script lang="ts">
	import { noop } from 'es-toolkit';
	import EmojiPickerSearch from './components/emoji-picker-search.svelte';
	import EmojiPickerSkin from './components/emoji-picker-skin.svelte';
	import { RecentEmojis } from './store';
	import {
		CATEGORIES,
		CATEGORIES_CONTAINER_HEIGHT,
		EMOJI_CONTAINER_HEIGHT,
		EMOJI_PER_ROW,
		NavigationDirection,
		RECENT,
		RECENT_EMOJI_CATEGORY,
		SEARCH_RESULTS,
		SMILEY_EMOTION,
		type ActionResult,
		type Categories,
		type CategoryOrEmojiRow,
		type CustomEmoji,
		type Emoji,
		type EmojiCategory,
		type EmojiCursor,
		type EmojiPosition,
		type EmojiRow,
	} from './types';
	import {
		createCategoryAndEmojiRows,
		getCursorProperties,
		getUpdatedCategoriesAndAllEmojis,
	} from './utils';
	import EmojiPickerCategories from './components/emoji-picker-categories.svelte';
	import EmojiPickerCurrentResults from './components/emoji-picker-current-results.svelte';
	import EmojiMap from './emoji-map';
	import { onMount, untrack } from 'svelte';
	import './components/item-styles.css';
	import EmojiPickerPreview from './components/emoji-picker-preview.svelte';

	type Props = {
		filter: string;
		onEmojiClick: (emoji: Emoji) => void;
		// handleFilterChange: (filter: string) => void;
		onAddCustomEmojiClick?: () => void;
		customEmojiPage?: number;
		// emojiMap: EmojiMap;
		recentEmojis?: string[];
		userSkinTone?: string;
		setUserSkinTone?: (skinTone: string) => void;
		incrementEmojiPickerPage?: () => void;
		// getCustomEmojis: (
		// 	page?: number,
		// 	perPage?: number,
		// 	sort?: string,
		// 	loadUsers?: boolean,
		// ) => Promise<ActionResult<CustomEmoji[]>>;
	};

	let {
		filter = $bindable(),
		onEmojiClick,
		// handleFilterChange,
		// emojiMap,
		recentEmojis = [],
		userSkinTone = 'default',
		setUserSkinTone = noop,
		incrementEmojiPickerPage = noop,
		customEmojiPage = 0,
		// getCustomEmojis,
	}: Props = $props();

	const getInitialActiveCategory = () => ($RecentEmojis.length ? RECENT : SMILEY_EMOTION);

	let cursor = $state.raw<EmojiCursor>({
		rowIndex: -1,
		emojiId: '',
		emoji: undefined,
	});
	let activeCategory = $state<EmojiCategory>(getInitialActiveCategory());

	const getInitialCategories = () =>
		$RecentEmojis.length ? { ...RECENT_EMOJI_CATEGORY, ...CATEGORIES } : CATEGORIES;

	let categories = $state(getInitialCategories());
	let allEmojis = $state.raw<Record<string, Emoji>>({});
	// let categoryOrEmojiRows = $state<CategoryOrEmojiRow[]>([]);
	let emojiPositions = $state<EmojiPosition[]>([]);
	let searchInputRef = $state<HTMLInputElement>();
	let infiniteLoaderRef = $state<unknown>();
	// let shouldRunCreateCategoryAndEmojiRows = $state<boolean>();
	// const [allEmojis, categories] = $derived(getUpdatedCategoriesAndAllEmojis(emojiMap, recentEmojis, userSkinTone, allEmojis))

	const emojiMap = new EmojiMap(new Map());

	$effect(() => {
		const res = getUpdatedCategoriesAndAllEmojis(
			emojiMap,
			recentEmojis,
			userSkinTone,
			untrack(() => allEmojis),
		);
		categories = res[0];
		allEmojis = res[1];
	});

	let categoryOrEmojisRows = $state<CategoryOrEmojiRow[]>([]);

	// $inspect(categories, allEmojis);

	// clear out the active category on search input
	$effect(() => {
		if (filter && activeCategory !== getInitialActiveCategory())
			activeCategory = getInitialActiveCategory();
	});

	const getEmojiById = (emojiId: string) => {
		if (!emojiId) return null;

		return (
			allEmojis[emojiId] || allEmojis[emojiId.toUpperCase()] || allEmojis[emojiId.toLowerCase()]
		);
	};

	const selectFirstEmoji = (emojiPositions: EmojiPosition[]) => {
		if (!emojiPositions[0]) return;

		const { rowIndex, emojiId } = emojiPositions[0];
		const cursorEmoji = getEmojiById(emojiId);
		if (cursorEmoji) {
			cursor = {
				rowIndex,
				emojiId,
				emoji: cursorEmoji,
			};
		}
	};

	$effect(() => {
		const [updatedCategoryOrEmojisRows, updatedEmojiPositions] = createCategoryAndEmojiRows(
			untrack(() => allEmojis),
			untrack(() => categories),
			filter,
			userSkinTone,
		);

		if (untrack(() => activeCategory) !== 'custom') {
			selectFirstEmoji(updatedEmojiPositions);
		}

		categoryOrEmojisRows = updatedCategoryOrEmojisRows;
		emojiPositions = updatedEmojiPositions;
	});

	const handleCategoryClick = (
		categoryRowIndex: CategoryOrEmojiRow['index'],
		categoryName: EmojiCategory,
		emojiId: string,
	) => {
		if (!categoryName || categoryName === activeCategory || !emojiId) return;

		activeCategory = categoryName;

		// TODO: add infinite load here

		const cursorEmoji = getEmojiById(emojiId);
		if (cursorEmoji) {
			cursor = {
				rowIndex: categoryRowIndex + 1,
				emojiId,
				emoji: cursorEmoji,
			};
		}
	};

	const resetCursor = () => {
		cursor = {
			rowIndex: -1,
			emojiId: '',
			emoji: undefined,
		};

		// add infinite load scroll here
	};

	// const onAddCustomEmojiClickInner = () => {
	// 	handleEmojiPickerClose();
	// 	onAddCustomEmojiClick?.();
	// };

	const [cursorCategory, cursorCategoryIndex, cursorEmojiIndex] = $derived(
		getCursorProperties(cursor.rowIndex, cursor.emojiId, categoryOrEmojisRows as EmojiRow[]),
	);

	const calculateNewCursorForUpArrow = (
		cursorCategory: string,
		emojiPositions: EmojiPosition[],
		currentCursorsPositionIndex: number,
		categories: Categories,
	) => {
		if (currentCursorsPositionIndex - EMOJI_PER_ROW >= 0) {
			// Emoji is present up a row in same x position
			const upTheRowCategoryName = emojiPositions[currentCursorsPositionIndex - EMOJI_PER_ROW]
				.categoryName as EmojiCategory;

			if (upTheRowCategoryName !== cursorCategory) {
				// If up the row emoji is in different category, move to that category's last emoji
				const upTheRowCategorysEmojis = categories[upTheRowCategoryName].emojiIds || [];
				const lastEmojiIdUpTheRow = upTheRowCategorysEmojis[upTheRowCategorysEmojis.length - 1];
				const lastEmojiPositionUpTheRow = emojiPositions.find((emojiPosition) => {
					return (
						emojiPosition.emojiId.toLowerCase() === lastEmojiIdUpTheRow.toLowerCase() &&
						emojiPosition.categoryName === upTheRowCategoryName
					);
				});
				return lastEmojiPositionUpTheRow;
			}

			// If up the row emoji is in same category, move up in same category
			return emojiPositions[currentCursorsPositionIndex - EMOJI_PER_ROW];
		}

		// When emojis in the assumingly top row are less than EMOJI_PER_ROW,
		// Check if those are of different category
		const startingEmojisOfDifferentCategory = emojiPositions
			.slice(0, currentCursorsPositionIndex)
			.reverse()
			.find((emojiPosition) => emojiPosition.categoryName !== cursorCategory);

		if (startingEmojisOfDifferentCategory) {
			return startingEmojisOfDifferentCategory;
		}

		// We are already at the first row, so focus on search
		focusOnSearchInput();
		return undefined;
	};

	const focusOnSearchInput = () => searchInputRef?.focus();

	onMount(() => focusOnSearchInput());

	const handleEnterOnEmoji = () => {
		if (cursor.emoji) onEmojiClick(cursor.emoji);
	};

	function calculateNewCursorForRightOrLeftArrow(
		moveTo: NavigationDirection,
		emojiPositions: EmojiPosition[],
		currentCursorIndexInEmojis: number,
	) {
		if (
			moveTo === NavigationDirection.NextEmoji &&
			currentCursorIndexInEmojis + 1 < emojiPositions.length
		) {
			// When next emoji is present, move to next emoji
			return emojiPositions[currentCursorIndexInEmojis + 1];
		}
		if (moveTo === NavigationDirection.PreviousEmoji && currentCursorIndexInEmojis - 1 >= 0) {
			// When previous emoji is present, move to previous emoji
			return emojiPositions[currentCursorIndexInEmojis - 1];
		}
		if (moveTo === NavigationDirection.PreviousEmoji && currentCursorIndexInEmojis - 1 < 0) {
			// If cursor was at first emoji then focus on search input
			focusOnSearchInput();
			return undefined;
		}

		return undefined;
	}

	function calculateNewCursorForDownArrow(
		cursorCategory: string,
		emojiPositions: EmojiPosition[],
		currentCursorsPositionIndex: number,
		categories: Categories,
	) {
		if (currentCursorsPositionIndex + EMOJI_PER_ROW < emojiPositions.length) {
			// Emoji is present down a row in same x position
			const downTheRowCategoryName = emojiPositions[currentCursorsPositionIndex + EMOJI_PER_ROW]
				.categoryName as EmojiCategory;

			if (downTheRowCategoryName !== cursorCategory) {
				// If down the row emoji is in different category, move to that category's first emoji
				const downTheRowCategorysEmojis = categories[downTheRowCategoryName].emojiIds || [];
				const firstEmojiIdDownTheRow = downTheRowCategorysEmojis[0];
				return emojiPositions.find((emojiPosition) => {
					return (
						emojiPosition.emojiId.toLowerCase() === firstEmojiIdDownTheRow.toLowerCase() &&
						emojiPosition.categoryName === downTheRowCategoryName
					);
				});
			}

			// If down the row emoji is in same category, move to down in same category
			return emojiPositions[currentCursorsPositionIndex + EMOJI_PER_ROW];
		}

		// When emoji down the row is not present.
		// Check if the remaining emojis are of different category
		const endingEmojisOfDifferentCategory = emojiPositions
			.slice(currentCursorsPositionIndex + 1, emojiPositions.length)
			.find((emojiPosition) => emojiPosition.categoryName !== cursorCategory);

		return endingEmojisOfDifferentCategory;
	}

	const handleKeyboardEmojiNavigation = (moveTo: NavigationDirection) => {
		if (!emojiPositions.length) return;

		let newCursor;

		if (cursor.emojiId.length !== 0 && cursor.rowIndex !== -1) {
			// If cursor is on an emoji
			const currentCursorsPositionIndex = emojiPositions.findIndex(
				(emojiPosition) =>
					emojiPosition.rowIndex === cursor.rowIndex &&
					emojiPosition.emojiId.toLowerCase() === cursor.emojiId.toLowerCase(),
			);

			if (currentCursorsPositionIndex === -1) {
				newCursor = undefined;
			} else if (
				moveTo === NavigationDirection.NextEmoji ||
				moveTo === NavigationDirection.PreviousEmoji
			) {
				newCursor = calculateNewCursorForRightOrLeftArrow(
					moveTo,
					emojiPositions,
					currentCursorsPositionIndex,
				);
			} else if (moveTo === NavigationDirection.NextEmojiRow) {
				newCursor = calculateNewCursorForDownArrow(
					cursorCategory,
					emojiPositions,
					currentCursorsPositionIndex,
					categories,
				);
			} else if (moveTo === NavigationDirection.PreviousEmojiRow) {
				newCursor = calculateNewCursorForUpArrow(
					cursorCategory,
					emojiPositions,
					currentCursorsPositionIndex,
					categories,
				);
			}
		} else if (cursor.emojiId.length === 0 && cursor.rowIndex === -1) {
			if (moveTo === NavigationDirection.NextEmoji || moveTo === NavigationDirection.NextEmojiRow) {
				// if no cursor is selected, set the first emoji on arrows right & down
				if (emojiPositions.length !== 0) {
					newCursor = emojiPositions[0];
				}
			}
		}

		// If newCursorIndex is less than 0, abort and do nothing
		if (newCursor === undefined) {
			return;
		}

		const newCursorEmoji = getEmojiById(newCursor.emojiId);
		if (!newCursorEmoji) {
			return;
		}

		searchInputRef?.setAttribute(
			'aria-activedescendant',
			newCursorEmoji.name.toLocaleLowerCase().replaceAll(' ', '_'),
		);

		cursor = {
			rowIndex: newCursor.rowIndex,
			emojiId: newCursor.emojiId,
			emoji: newCursorEmoji,
		};

		// TODO: scroll to row index
	};

	const areSearchResultsEmpty = $derived(
		filter.length !== 0 &&
			categoryOrEmojisRows.length === 1 &&
			categoryOrEmojisRows?.[0]?.items?.[0]?.categoryName === SEARCH_RESULTS,
	);

	const handleEmojiOnMouseOver = (mouseOverCursor: EmojiCursor) => {
		if (mouseOverCursor.emojiId !== cursor.emojiId || cursor.emojiId === '')
			cursor = mouseOverCursor;
	};
</script>

<div class="flex items-center justify-between relative m-3 gap-2">
	<EmojiPickerSearch
		bind:value={filter}
		bind:ref={searchInputRef}
		{cursorCategoryIndex}
		{cursorEmojiIndex}
		focus={focusOnSearchInput}
		onEnter={handleEnterOnEmoji}
		onKeyDown={handleKeyboardEmojiNavigation}
		resetCursorPosition={resetCursor}
	/>
	<EmojiPickerSkin {userSkinTone} onSkinSelected={setUserSkinTone} />
</div>

{#if !filter.length}
	<EmojiPickerCategories
		isFiltering={filter.length > 0}
		active={activeCategory}
		{categories}
		onclick={handleCategoryClick}
		onkeydown={handleKeyboardEmojiNavigation}
		{focusOnSearchInput}
	/>
{/if}
{#if areSearchResultsEmpty}
	<div style="height: {EMOJI_CONTAINER_HEIGHT + CATEGORIES_CONTAINER_HEIGHT}px">No result</div>
{:else}
	<EmojiPickerCurrentResults
		isFiltering={filter.length > 0}
		bind:activeCategory
		{categoryOrEmojisRows}
		cursorEmojiId={cursor.emojiId}
		cursorRowIndex={cursor.rowIndex}
		{onEmojiClick}
		onEmojiMouseOver={handleEmojiOnMouseOver}
		{customEmojiPage}
		{incrementEmojiPickerPage}
		customEmojisEnabled={false}
	/>
	<div>
		{#if !areSearchResultsEmpty}
			<EmojiPickerPreview emoji={cursor.emoji} />
		{/if}
	</div>
{/if}
