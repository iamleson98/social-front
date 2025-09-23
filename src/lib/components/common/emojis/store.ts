import type { RecentEmojiData } from './types';
import { writable } from 'svelte/store';

/** keeps tracks of most sently used emojis */
export const RecentEmojis = writable<RecentEmojiData[]>([]);
