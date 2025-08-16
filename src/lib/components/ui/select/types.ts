import type { HTMLSelectAttributes } from "svelte/elements";
import type { SocialSize } from "../common";
import type { InputProps } from "../Input";
import type { OnscrollToEndOpts } from "$lib/actions/scroll-end";
import type { SocialVariant } from "$lib/utils";

export type SelectOption = {
  value: Primitive;
  label: string;
  /** default `false` */
  disabled?: boolean;
};

export type SelectItemprops = {
  idx: number;
  optionClassName: string;
  onclick?: () => void;
  ref?: HTMLLIElement;
} & SelectOption;

export type Primitive = string | number;

export type SelectProps<T extends SelectOption = SelectOption> = {
  options: T[];
  value?: Primitive[] | Primitive;
  size?: SocialSize | 'xxs';
  /** number of items to fully display, the rest will be summaried as "+n". if <= 0, throw Error  */
  maxDisplay?: number;
  onchange?: (opts?: T[] | T) => void;
  /** for infinite loading, show loading more indicator when scroll to the end of the list */
  showLoadingMore?: boolean;
  /** callback function to be called when the scroll reaches the end of the list */
  onScrollToEnd?: OnscrollToEndOpts['onScrollToEnd'];
  onclearInputField?: () => void;
  variant?: SocialVariant;
} & Omit<InputProps, 'value' | 'size' | 'onchange' | 'variant'> & Omit<HTMLSelectAttributes, 'size' | 'onchange' | 'onblur' | 'multiple'>;

/** SIZE_REDUCE_MAP is useful you want your input and badge items to reasonably fit your multi select component */
export const SIZE_REDUCE_MAP: Record<SocialSize | 'xxs', SocialSize | 'xxs'> = {
  xxs: 'xxs',
  xs: 'xxs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
  xl: 'lg',
};

export const SELECT_CLASSES = {
  selectMenu: 'absolute left-0 text-left mt-1 text-sm w-full max-h-64 overflow-y-auto bg-white rounded-md z-10000 shadow-sm border border-gray-200',
  selectOption: 'wrap-break-word text-left w-full px-4 py-1 hover:bg-blue-50 aria-selected:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all select-none!',
  activeSelectOption: 'bg-blue-50 text-blue-600',
};
