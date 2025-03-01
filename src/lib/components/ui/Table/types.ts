import type { IconType } from "$lib/components/icons";
import type { PageInfo } from "$lib/gql/graphql";

export type TableProps<T extends Record<string, unknown>> = {
  items: T[];
  columns: TableColumnProps<T>[];
  tableClass?: string;
  pagination?: PageInfo;
  onNextPagelick?: (afterCursor: string) => void;
  onPreviousPagelick?: (beforeCursor: string) => void;
  onChangeRowsPerPage?: (no: number) => void;
  /**default to [10, 20, 30, 50, 100] */
  rowsOptions?: number[];
  onSortChange?: (sort: SortState) => void;
};

export type TableColumnProps<T extends Record<string, unknown>> = {
  title: string;
  startIcon?: IconType;
  endIcon?: IconType;
  sortable?: boolean;
  getter: (item: T) => string | number;
};

export type SortDirection = 'asc' | 'desc' | 'neutral';
export type SortState = Record<string, { direction: SortDirection; icon: IconType }>;
