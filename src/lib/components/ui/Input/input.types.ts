import type { IconContent } from "$lib/components/icons";
import type { SocialVariant } from "$lib/utils";
import { type Snippet } from "svelte";
import type { SocialSize } from "../common";
import type { ShortcutOptions } from "$lib/actions/shortcut";
import type { InputDebounceOpts } from "$lib/actions/input-debounce";
import type { HTMLInputAttributes, HTMLTextareaAttributes } from "svelte/elements";

export type CustomInputProps = {
  label?: string;
  variant?: SocialVariant | 'ghost';
  subText?: string;
  startIcon?: IconContent;
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

export const INPUT_CLASSES: Record<SocialVariant | 'ghost', Record<'bg' | 'fg', string>> = {
  info: {
    bg: 'bg-white text-gray-900 ring-1 focus-within:ring-2 focus-within:ring-blue-500 focus:ring-2 ring-gray-200 focus:ring-blue-500 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500',
    fg: 'text-gray-800! dark:text-white',
  },
  success: {
    bg: 'bg-green-50 text-green-700 ring-1 focus:ring-2 focus-within:ring-2 focus-within:ring-red-500 ring-green-200 placeholder-green-600 focus:ring-green-500 dark:bg-green-700 dark:placeholder-green-400 dark:text-white dark:focus:ring-green-500',
    fg: 'text-green-600!',
  },
  error: {
    bg: 'bg-red-50 text-red-700 ring-1 focus-within:ring-2 focus-within:ring-red-500 focus:ring-2 placeholder-red-600 ring-red-200 focus:ring-red-500 dark:bg-red-700 dark:placeholder-red-400 dark:text-white dark:focus:ring-red-500',
    fg: 'text-red-600!',
  },
  warning: {
    bg: 'bg-orange-50 text-orange-700 ring-1 focus-within:ring-2 focus-within:ring-red-500 focus:ring-2 placeholder-orange-600 ring-orange-200 focus:ring-orange-500 dark:bg-orange-700 dark:placeholder-orange-400 dark:text-white dark:focus:ring-orange-500',
    fg: 'text-orange-600!',
  },
  ghost: {
    bg: 'bg-transparent text-gray-700 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:bg-gray-700',
    fg: 'text-gray-700 dark:text-white',
  }
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

export const RADIO_SIZES: Record<SocialSize, string> = {
  xs: 'radio-xs',
  sm: 'radio-sm',
  md: 'radio-md',
  lg: 'radio-lg',
  xl: 'radio-xl',
};

export const TOGGLE_SIZES: Record<SocialSize, string> = {
  xs: 'toggle-xs',
  sm: 'toggle-sm',
  md: 'toggle-md',
  lg: 'toggle-lg',
  xl: 'toggle-xl',
};

export const TEXT_AREA_SIZE_MAP: Record<SocialSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};
