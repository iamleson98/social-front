import type { SocialSize } from "../common";
import type { InputProps } from "../Input";

export type SelectOption = {
  value: string | number;
  label: string;
};

export type SelectItemprops = {
  /** default `false` */
  disabled: boolean;
  idx: number;
  option: SelectOption;
  optionClassName: string;
  onclick?: () => void;
};

export type SelectProps = {
  options: SelectOption[];
  value?: string | number;
} & Omit<InputProps, 'value'>;

export type SelectOptionExtends = SelectOption & Record<string, unknown>;

export type MultiSelectProps = {
  options: SelectOptionExtends[];
  value: SelectOptionExtends[];
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
  selectOption: 'text-left w-full px-4 py-1 hover:bg-blue-50 aria-selected:bg-blue-50 hover:text-blue-600',
  activeSelectOption: 'bg-blue-50 text-blue-600',
};
