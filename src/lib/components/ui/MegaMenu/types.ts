
export type SelectItemProps = {
	title: string;
	value: string | number;
	/** to determine the ancestory level */
	level: number;
	children?: SelectItemProps[];
};

export type MenuProps = {
	items: SelectItemProps[];
	onSelect?: (item: SelectItemProps) => void;
	onSelectWhole?: (items: SelectItemProps[]) => void;
	onDeselect?: () => void;
	disabled?: boolean;
	onScrollToEnd?: () => void;
};

export const traverseMenu = () => {};
