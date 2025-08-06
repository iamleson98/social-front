import { writable } from "svelte/store";
import type { RecentEmojiData } from "./types";

/** keeps tracks of most sently used emojis */
export const RecentEmojis = writable<RecentEmojiData[]>([])
