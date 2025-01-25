import type { HTMLSelectAttributes } from "svelte/elements";
import type { SocialSize } from "../common";
import type { InputProps } from "../Input";

export type SelectOption = {
  value: string | number;
  label: string;
  /** default `false` */
  disabled?: boolean;
};

export type SelectItemprops<T extends SelectOption = SelectOption> = {
  idx: number;
  optionClassName: string;
  onclick?: () => void;
} & T;

export type SelectProps<T extends SelectOption = SelectOption> = {
  options: T[];
  value?: SelectOption['value'];
  onchange?: (opt: T) => void;
} & Omit<InputProps, 'value' | 'onchange'> & Omit<HTMLSelectAttributes, 'size'>;

export type MultiSelectProps<T extends SelectOption = SelectOption> = {
  options: T[];
  value: T[];
  size: Exclude<SocialSize, 'xs'>
  /** number of items to fully display, the rest will be summaried as "+n". if <= 0, throw Error  */
  maxDisplay?: number;
} & Omit<InputProps, "value" | "size">;

/** SIZE_REDUCE_MAP is useful you want your input and badge items to reasonably fit your multi select component */
export const SIZE_REDUCE_MAP: Record<Exclude<SocialSize, 'xs'>, SocialSize> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
  xl: 'lg',
};

export const SELECT_CLASSES = {
  selectMenu: 'absolute left-0 text-left mt-1 text-sm w-full max-h-64 overflow-y-auto bg-white rounded-md z-10000 shadow-sm border border-gray-200',
  selectOption: 'text-left w-full px-4 py-1 hover:bg-blue-50 aria-selected:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all select-none!',
  activeSelectOption: 'bg-blue-50 text-blue-600',
};
