
export type SelectItemProps = {
  title: string;
  value: string | number;
  children?: SelectItemProps[];
};

export type MenuProps = {
  items: SelectItemProps[];
  onSelect?: (item: SelectItemProps) => void;
  onSelectWhole?: (items: SelectItemProps[]) => void;
  onDeselect?: () => void;
  disabled?: boolean;
  value?: string | number;
  values?: (string | number)[];
};

export const traverseMenu = () => { }
