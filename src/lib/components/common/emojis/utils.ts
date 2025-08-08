import { CATEGORY_HEADER_ROW, EMOJI_PER_ROW, type Categories, type CategoryHeaderRow, type CategoryOrEmojiRow, type Emoji, type EmojiCategory, type EmojiCursor, type EmojiRow, type SystemEmoji } from "./types";

export function calculateCategoryRowIndex(categories: Categories, categoryName: EmojiCategory) {
  const categoryIndex = Object.keys(categories).findIndex((category) => category === categoryName);

  const categoriesTillCurrentCategory = Object.values(categories).slice(0, categoryIndex);

  const rowIndex = categoriesTillCurrentCategory.reduce((previousIndexSum, currentCategory) => {
    const emojisInCurrentCategory = currentCategory?.emojiIds?.length ?? 0;

    const numberOfEmojiRowsInCurrentCategory = Math.ceil(emojisInCurrentCategory / EMOJI_PER_ROW);

    return previousIndexSum + numberOfEmojiRowsInCurrentCategory + 1;
  }, 0);

  return rowIndex;
};

export function isCategoryHeaderRow(row: CategoryOrEmojiRow): row is CategoryHeaderRow {
  return row.type === CATEGORY_HEADER_ROW;
}

export function getCursorProperties(cursorRowIndex: EmojiCursor['rowIndex'], cursorEmojiId: EmojiCursor['emojiId'], categoryOrEmojisRows: EmojiRow[]): [string, number, number] {
  if (cursorEmojiId.length === 0 || cursorRowIndex === -1) {
    return ['', -1, -1];
  }

  const emojisRowOfCursor = categoryOrEmojisRows?.[cursorRowIndex]?.items ?? [];

  // The row should atleast contain one emoji
  if (emojisRowOfCursor.length < 1) {
    return ['', -1, -1];
  }

  const cursorCategory = emojisRowOfCursor[0]?.categoryName ?? '';
  const cursorCategoryIndex = emojisRowOfCursor[0]?.categoryIndex ?? -1;

  const cursorEmojiIndex = emojisRowOfCursor.find((emojiItem) => {
    return emojiItem.emojiId === cursorEmojiId;
  })?.emojiIndex ?? -1;

  return [cursorCategory, cursorCategoryIndex, cursorEmojiIndex];
};

export function isSystemEmoji(emoji: Emoji): emoji is SystemEmoji {
  if ('category' in emoji) {
    return emoji.category !== 'custom';
  }

  return !('id' in emoji);
}

const getSystemEmojiImageUrl = (filename: string) => {
  const extension = filename.endsWith('.png') ? '' : '.png';
  return `/static/emoji/${filename}${extension}`;
}

const getEmojiRoute = (emojiId: string) => {
  return `/emoji/${emojiId}`;
}

export function getEmojiImageUrl(emoji: Emoji): string {
  if (!isSystemEmoji(emoji) && emoji.id === 'sitename') {
    return getSystemEmojiImageUrl('sitename');
  }

  if (isSystemEmoji(emoji)) {
    const emojiUnified = emoji?.unified?.toLowerCase() ?? '';
    const filename = emojiUnified || emoji.short_names[0];

    return getSystemEmojiImageUrl(filename);
  }

  return getEmojiRoute(emoji.id) + '/image';
}

export function getEmojiName(emoji: Emoji): string {
  return isSystemEmoji(emoji) ? emoji.short_name : emoji.name;
}

export function parseEmojiNamesFromText(text: string): string[] {
  if (!text.includes(':')) {
    return [];
  }

  const pattern = /:([A-Za-z0-9_-]+):/gi;
  const customEmojis = new Set<string>();
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (!match) {
      continue;
    }

    customEmojis.add(match[1]);
  }

  return Array.from(customEmojis);
}
