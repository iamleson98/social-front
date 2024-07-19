export type SelectItem<T extends string | number> = {
  label: string;
  value: T;
  children?: SelectItem<T>[];
};
