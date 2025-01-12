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

export type MultiSelectProps = {
  options: SelectOption[];
  value: Array<SelectOption>;
} & Omit<InputProps, "value">;

export const SELECT_CLASSES = {
  selectMenu: 'absolute left-0 text-left mt-1 text-sm w-full max-h-64 overflow-y-auto bg-white rounded-md z-10000 shadow-sm border border-gray-200',
  selectOption: 'text-left w-full px-4 py-1 hover:bg-blue-50 aria-selected:bg-blue-50 hover:text-blue-600',
  activeSelectOption: 'bg-blue-50 text-blue-600',
};
