import { CATEGORY_HEADER_ROW, EMOJI_PER_ROW, type Categories, type CategoryHeaderRow, type CategoryOrEmojiRow, type EmojiCategory, type EmojiCursor, type EmojiRow } from "./types";

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
