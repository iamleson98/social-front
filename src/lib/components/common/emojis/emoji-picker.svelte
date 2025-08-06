<script lang="ts">
	import { RecentEmojis } from './store';
	import {
		CATEGORIES,
		EMOJI_PER_ROW,
		RECENT,
		RECENT_EMOJI_CATEGORY,
		SMILEY_EMOTION,
		type Categories,
		type CategoryOrEmojiRow,
		type Emoji,
		type EmojiCategory,
		type EmojiCursor,
		type EmojiPosition,
		type EmojiRow,
	} from './types';
	import { getCursorProperties } from './utils';

	type Props = {
		filter: string;
		onEmojiClick: (emoji: Emoji) => void;
		handleFilterChange: (filter: string) => void;
		handleEmojiPickerClose: () => void;
		onAddCustomEmojiClick?: () => void;
		customEmojiEnabled?: boolean;
		customEmojiPage?: number;
		// emojiMap
	};

	let {
		filter,
		onEmojiClick,
		handleEmojiPickerClose,
		onAddCustomEmojiClick,
		handleFilterChange,
	}: Props = $props();

	const getInitialActiveCategory = () => ($RecentEmojis.length ? RECENT : SMILEY_EMOTION);

	let cursor = $state.raw<EmojiCursor>({
		rowIndex: -1,
		emojiId: '',
		emoji: undefined,
	});
	let activeCategory = $state(getInitialActiveCategory());

	const getInitialCategories = () =>
		$RecentEmojis.length ? { ...RECENT_EMOJI_CATEGORY, ...CATEGORIES } : CATEGORIES;

	let categories = $state(getInitialCategories());
	let allEmojis = $state.raw<Record<string, Emoji>>({});
	let categoryOrEmojiRows = $state<CategoryOrEmojiRow[]>([]);
	let emojiPositions = $state<EmojiPosition[]>([]);
	let searchInputRef = $state<HTMLInputElement>();
	let infiniteLoaderRef = $state<unknown>();
	let shouldRunCreateCategoryAndEmojiRows = $state<boolean>();

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

	const handleCategoryClick = (
		categoryRowIndex: CategoryOrEmojiRow['index'],
		categoryName: EmojiCategory,
		emojiId: string,
	) => {
		if (!categoryName || categoryName === activeCategory || !emojiId) return;

		activeCategory = categoryName;

		// add infinite load here

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

	const onAddCustomEmojiClickInner = () => {
		handleEmojiPickerClose();
		onAddCustomEmojiClick?.();
	};

	const [cursorCategory, cursorCategoryIndex, cursorEmojiIndex] = $derived(
		getCursorProperties(cursor.rowIndex, cursor.emojiId, categoryOrEmojiRows as EmojiRow[]),
	);

	const calculateNewCursorForUpArrow = (
		cursorCategory: string,
		emojiPositions: EmojiPosition[],
		currentCursorsPositionIndex: number,
		categories: Categories,
		focusOnSearchInput: () => void,
	) => {
		if (currentCursorsPositionIndex - EMOJI_PER_ROW >= 0) {
			const upTheRowCategoryName = emojiPositions[currentCursorsPositionIndex - EMOJI_PER_ROW]
				.categoryName as EmojiCategory;

			if (upTheRowCategoryName !== cursorCategory) {
				// const
			}
		}
	};
</script>
