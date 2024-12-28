import type { IconType } from "$lib/components/icons";
import type { SocialVariant } from "$lib/utils";
import { type Snippet } from "svelte";
import type { SocialSize } from "../common";
import type { ShortcutOptions } from "$lib/actions/shortcut";
import type { InputDebounceOpts } from "$lib/actions/input-debounce";
import type { HTMLInputAttributes } from "svelte/elements";

export type InputProps = {
  label?: string;
  variant?: Exclude<SocialVariant, 'warning'>;
  subText?: string;
  startIcon?: IconType;
  size?: SocialSize;
  /** a component to the end of input */
  action?: Snippet;
  ref?: HTMLInputElement | HTMLTextAreaElement;

  /** indicate if this component is being used in as <Select /> component */
  selectShortcutOptions?: ShortcutOptions<HTMLInputElement | HTMLTextAreaElement>[];
  inputDebounceOption?: InputDebounceOpts;
} & Omit<HTMLInputAttributes, 'size'>;

export const INPUT_TYPES: Record<Exclude<SocialVariant, 'warning'>, Record<'bg' | 'fg', string>> = {
  info: {
    bg: 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
    fg: '!text-gray-800 dark:text-white',
  },
  success: {
    bg: 'bg-green-50 border-green-300 text-green-700 placeholder-green-600 focus:ring-green-500 focus:border-green-500 dark:bg-green-700 dark:border-green-600 dark:placeholder-green-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500',
    fg: '!text-green-600',
  },
  error: {
    bg: 'bg-red-50 border-red-300 text-red-700 placeholder-red-600 focus:ring-red-500 focus:border-red-500 dark:bg-red-700 dark:border-red-600 dark:placeholder-red-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500',
    fg: '!text-red-600',
  },
}

export const INPUT_LABEL_SIZE_STYLE_MAP: Record<SocialSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};
