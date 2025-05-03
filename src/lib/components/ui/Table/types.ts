import { ChevronDown, ChevronSort, ChevronUp, type IconContent } from "$lib/components/icons";
import type { OrderDirection, PageInfo } from "$lib/gql/graphql";
import type { Snippet } from "svelte";


export const ROW_OPTIONS = [10, 20, 30, 50, 100] as const;

export type RowOptions = typeof ROW_OPTIONS[number];

export type TableProps<T extends Record<string, unknown>, K extends string> = {
  items: T[];
  columns: TableColumnProps<T, K>[];
  tableClass?: string;
  pagination?: PageInfo;
  onNextPagelick?: (afterCursor: string) => void;
  onPreviousPagelick?: (beforeCursor: string) => void;
  onChangeRowsPerPage?: (no: RowOptions) => void;
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
};

export type TableColumnProps<T extends Record<string, unknown>, K extends string> = {
  /** the head title of each column */
  title: string;
  /**
   * Key of the column to be used for sorting.
   * If not provided, the column will not be sortable.
   */
  key?: K;
  startIcon?: IconContent;
  endIcon?: IconContent;
  /**
   * If true (in conjunction with key), the column will be sortable.
   */
  sortable?: boolean;
  /**
   * The content of each row in the column.
   * @param item the item of the row
   */
  child: Snippet<[{ item: T }]>;

  /**
   * The placement of the column within the table data cell.
   * @default 'left'
   */
  placement?: 'center' | 'left' | 'right';
};

export type SortDirection = OrderDirection | 'NEUTRAL';
export type SortState<K extends string = string> = Record<K, SortDirection>;

export const SortIconsMap: Record<SortDirection, IconContent> = {
  ASC: ChevronUp,
  DESC: ChevronDown,
  NEUTRAL: ChevronSort,
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
  sortBy?: Record<string, unknown> & {
    field: string;
    direction: OrderDirection;
  } | null;
};
