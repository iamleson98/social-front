import { ChevronDown, ChevronSort, ChevronUp, type IconContent } from "$lib/components/icons";
import type { PageInfo } from "$lib/gql/graphql";
import type { Snippet } from "svelte";


export type TableProps<T extends Record<string, unknown>> = {
  items: T[];
  columns: TableColumnProps<T>[];
  tableClass?: string;
  pagination?: PageInfo;
  onNextPagelick?: (afterCursor: string) => void;
  onPreviousPagelick?: (beforeCursor: string) => void;
  onChangeRowsPerPage?: (no: number) => void;
  onSortChange?: (sort: SortState) => void;
  scale?: 'md' | 'sm';
  rowsPerPage?: number | null;
  /**
   * Allow multiple columns to be sorted.
   * Currently we support single field sort only
   */
  sortMultiple?: boolean;
  defaultSortState?: SortState;
};

export type TableColumnProps<T extends Record<string, unknown>> = {
  title: string;
  key?: string;
  startIcon?: IconContent;
  endIcon?: IconContent;
  sortable?: boolean;
  child: Snippet<[{ item: T }]>
};

export type SortDirection = 'asc' | 'desc' | 'neutral';
export type SortState = Record<string, SortDirection>;

export const SortIconsMap: Record<SortDirection, IconContent> = {
  asc: ChevronUp,
  desc: ChevronDown,
  neutral: ChevronSort,
};
