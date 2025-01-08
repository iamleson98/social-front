
export type SelectItemProps = {
  title: string;
  value: string | number;
  children?: SelectItemProps[];
};

export type MenuProps = {
  items: SelectItemProps[];
  onSelect: (item: SelectItemProps) => void;
};
