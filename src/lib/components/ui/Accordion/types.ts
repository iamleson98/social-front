import type { IconContent } from '$lib/components/icons';
import type { Snippet } from 'svelte';

export type AccordionProps = {
	header: Snippet | string;
	headerIcon?: IconContent;
	class?: string;
	/** extra classes appended to the header label row (e.g. micro-label styling) */
	headerClass?: string;
	children: Snippet;
	open?: boolean;
	/** if `true`, the `open` stays the same as the current state */
	fixed?: boolean;
	onToggle?: (open: boolean) => void;
};

export type AccordionListProps<T> = Omit<AccordionProps, 'children'> & {
	child: Snippet<[T]>;
	items: T[];
	/** default `all` */
	partialDisplay?: number | 'all';
	/** default `1000`. duration for loading indicator to show before showing more items */
	loadingMoreTimeout?: number;
};
