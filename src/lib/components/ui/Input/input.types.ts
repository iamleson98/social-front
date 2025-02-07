import type { IconType } from "$lib/components/icons";
import type { SocialVariant } from "$lib/utils";
import { type Snippet } from "svelte";
import type { SocialSize } from "../common";
import type { ShortcutOptions } from "$lib/actions/shortcut";
import type { InputDebounceOpts } from "$lib/actions/input-debounce";
import type { HTMLInputAttributes, HTMLTextareaAttributes } from "svelte/elements";

export type CustomInputProps = {
  label?: string;
  variant?: Exclude<SocialVariant, 'warning'>;
  subText?: string;
  startIcon?: IconType;
  /** size of the input, default = `md` */
  size?: SocialSize;
  /** a component to the end of input */
  action?: Snippet;
  ref?: HTMLInputElement | HTMLTextAreaElement;
  inputClass?: string;

  /** indicate if this component is being used in as <Select /> component */
  selectShortcutOptions?: ShortcutOptions<HTMLInputElement | HTMLTextAreaElement>[];
  inputDebounceOption?: InputDebounceOpts;
  /** Input is used in `<Select />` component. We need to insert the menu items before subText */
  children?: Snippet;
}

export type InputProps = CustomInputProps & Omit<HTMLInputAttributes, 'size'>;
export type TextAreaPropsProps = CustomInputProps & Omit<HTMLTextareaAttributes, 'size'>;

export const INPUT_TYPES: Record<Exclude<SocialVariant, 'warning'>, Record<'bg' | 'fg', string>> = {
  info: {
    bg: 'bg-white text-gray-900 ring-gray-200 focus:ring-blue-500 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500',
    fg: 'text-gray-800! dark:text-white',
  },
  success: {
    bg: 'bg-green-50 text-green-700 ring-green-200 placeholder-green-600 focus:ring-green-500 dark:bg-green-700 dark:placeholder-green-400 dark:text-white dark:focus:ring-green-500',
    fg: 'text-green-600!',
  },
  error: {
    bg: 'bg-red-50 text-red-700 placeholder-red-600 ring-red-200 focus:ring-red-500 dark:bg-red-700 dark:placeholder-red-400 dark:text-white dark:focus:ring-red-500',
    fg: 'text-red-600!',
  },
}

export const INPUT_LABEL_SIZE_STYLE_MAP: Record<SocialSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export const CHECKBOX_SIZES: Record<SocialSize, string> = {
  xs: 'checkbox-xs',
  sm: 'checkbox-sm',
  md: 'checkbox-md',
  lg: 'checkbox-lg',
  xl: 'checkbox-xl',
};
