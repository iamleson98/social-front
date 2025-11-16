import { ArrowDown, ArrowUp, type IconContent } from '$lib/components/icons';
import { TablerArrowDownUp } from '$lib/components/icons/consts';
import type { OrderDirection, PageInfo } from '$lib/gql/graphql';
import type { Snippet } from 'svelte';

export const ROW_OPTIONS = [10, 20, 30, 50, 100] as const;

export type RowOptions = (typeof ROW_OPTIONS)[number];

export type RestPagination = {
	totalCount: number;
	rowsPerPage: RowOptions;
};

export type TableProps<T extends Record<string, unknown>, K extends string = string> = {
	items: T[];
	columns: TableColumnProps<T, K>[];
	class?: string;
	/** Supports graphql pagination */
	graphqlPagination?: PageInfo;
	/** Supports restful pagination */
	restPagination?: RestPagination;
	onNextPagelick?: (afterCursor: string) => void;
	onPreviousPagelick?: (beforeCursor: string) => void;
	onChangeRowsPerPage?: (num: RowOptions) => void;
	onSortChange?: (sort: SortState<K>) => void;
	rowsPerPage?: RowOptions;
	/**
	 * Allow multiple columns to be sorted.
	 * Currently we support single field sort only
	 */
	sortMultiple?: boolean;
	defaultSortState?: SortState<K>;
	/** for example when your data is fetching, it is batter to temporary disable interactive items within the table */
	disabled?: boolean;
	/** 
	 * If provided, you can exchange positions of rows of your table. Default to `undefined`
	 * NOTE: If your row contains interactive elements, you should provide `data-interactive` attribute to their html element
	 */
	onDragEnd?: (dragIndex: number, dropIndex: number) => void;
	headless?: boolean;
	/** if provided, table will have fixed height. Table body will be scrollable, and table header will be sticky */
	maxHeight?: number;

	numOfRowsTitle?: string;
	prevPageTitle?: string;
	nextPageTitle?: string;
};

export type TableCellProps<T> = {
	item: T;
	idx: number;
};

export type TableColumnProps<T extends Record<string, unknown>, K extends string = string> = {
	/** the head title of each column */
	title: string | Snippet<[{ items: T[] }]>;
	/**
	 * Key of the column to be used for sorting.
	 * If not provided, the column will not be sortable.
	 */
	key?: K;
	startIcon?: IconContent;
	endIcon?: IconContent;
	/**
	 * The content of each row in the column.
	 * @param item the item of the row
	 */
	child: Snippet<[TableCellProps<T>]> | {render: (props: TableCellProps<T>) => any};
	/** plain positive integer number */
	width?: number;
};

export type SortDirection = OrderDirection | 'NEUTRAL';
export type SortState<K extends string = string> = Record<K, SortDirection>;

export const SortIconsMap: Record<SortDirection, IconContent> = {
	ASC: ArrowUp,
	DESC: ArrowDown,
	NEUTRAL: TablerArrowDownUp,
};

export type CountableConnection<T> = {
	edges: Array<ConnectionEdge<T>>;
	pageInfo: PageInfo;
	totalCount?: number | null;
};

export type ConnectionEdge<T> = {
	cursor: string;
	node: T;
};

export type GraphqlPaginationArgs = {
	first?: number | null;
	last?: number | null;
	after?: string | null;
	before?: string | null;
	sortBy?:
		| (Record<string, unknown> & {
				field?: string | null;
				direction: OrderDirection;
		  })
		| null;
} & Record<string, unknown>;
