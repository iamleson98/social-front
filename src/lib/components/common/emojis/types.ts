export type EmojiCategory =
  | 'recent'
  | 'searchResults'
  | 'smileys-emotion'
  | 'people-body'
  | 'animals-nature'
  | 'food-drink'
  | 'activities'
  | 'travel-places'
  | 'objects'
  | 'symbols'
  | 'flags'
  | 'custom';

export type CustomEmoji = {
  id: string;
  name: string;
  category: 'custom';
  create_at: number;
  update_at: number;
  delete_at: number;
  creator_id: string;
};

export type ActionResult<Data = unknown, Error = unknown> = {
    data?: Data;
    error?: Error;
};

export type SystemEmoji = {
  name: string;
  category: EmojiCategory;
  image: string;
  short_name: string;
  short_names: string[];
  batch: number;
  skins?: string[];
  skin_variations?: Record<string, SystemEmojiVariation>;
  unified: string;
};

export type SystemEmojiVariation = {
  unified: string;
  non_qualified: null;
  image: string;
  sheet_x: number;
  sheet_y: number;
  added_in: string;
  has_img_apple: boolean;
  has_img_google: boolean;
  has_img_twitter: boolean;
  has_img_facebook: boolean;
}

export type Emoji = SystemEmoji | CustomEmoji;

export type EmojisState = {
  customEmoji: {
    [x: string]: CustomEmoji;
  };
  nonExistentEmoji: Set<string>;
};

export type RecentEmojiData = {
  name: string;
  usageCount: number;
};

export const RECENT = 'recent';
export const SEARCH_RESULTS = 'searchResults';
export const SMILEY_EMOTION = 'smileys-emotion';
export const CUSTOM = 'custom';

export type Category = {
  name: EmojiCategory;
  emojiIds?: string[];
  label: string;
  iconClassName: string;
};

export type Categories = Record<EmojiCategory, Category>;

export type CategoryOrEmojiRow = CategoryHeaderRow | EmojiRow;

export type CategoryHeaderRow = {
  index: number;
  type: typeof CATEGORY_HEADER_ROW;
  items: Array<{
    categoryIndex: number;
    categoryName: EmojiCategory;
    emojiIndex: -1;
    emojiId: '';
    item: undefined;
  }>;
}

export type EmojiRow = {
  index: number;
  type: typeof EMOJIS_ROW;
  items: Array<{
    categoryIndex: number;
    categoryName: EmojiCategory;
    emojiIndex: number;
    emojiId: CustomEmoji['id'] | SystemEmoji['unified'];
    item: Emoji;
  }>;
}

export type EmojiCursor = {
  rowIndex: number;
  emojiId: CustomEmoji['id'] | SystemEmoji['unified'];
  emoji: Emoji | undefined;
};

export type EmojiPosition = {
  rowIndex: number;
  emojiId: CustomEmoji['id'] | SystemEmoji['unified'];
  categoryName: EmojiCategory;
}

export enum NavigationDirection {
  NextEmoji = 'next',
  PreviousEmoji = 'previous',
  NextEmojiRow = 'nextRow',
  PreviousEmojiRow = 'previousRow',
}

export const RECENT_EMOJI_CATEGORY: Pick<Categories, 'recent'> = { recent: emojiCategories.recent };
export const SEARCH_EMOJI_CATEGORY: Pick<Categories, typeof SEARCH_RESULTS> = { searchResults: emojiCategories.searchResults };

export const CATEGORIES: Categories = Emoji.CategoryNames.
  filter((category) => !(category === 'recent' || category === 'searchResults')).
  reduce((previousCategory, currentCategory) => {
    return {
      ...previousCategory,
      [currentCategory]: emojiCategories[currentCategory as EmojiCategory],
    };
  }, {} as Categories);

export const EMOJI_PER_ROW = 9; // needs to match variable `$emoji-per-row` in _variables.scss
export const ITEM_HEIGHT = 36; //as per .emoji-picker__item height in _emoticons.scss
export const EMOJI_CONTAINER_HEIGHT = 290; // If this changes, the spaceRequiredAbove and spaceRequiredBelow props passed to the EmojiPickerOverlay must be updated
export const CATEGORIES_CONTAINER_HEIGHT = 36; // height of categories container (28px) + margin (8px)

export const CATEGORY_HEADER_ROW = 'categoryHeaderRow';
export const EMOJIS_ROW = 'emojisRow';

export const EMOJI_SCROLL_THROTTLE_DELAY = 150;
export const EMOJI_ROWS_OVERSCAN_COUNT = 1;

export const CUSTOM_EMOJIS_PER_PAGE = 200;
export const CUSTOM_EMOJI_SEARCH_THROTTLE_TIME_MS = 1000;
