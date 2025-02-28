import type { IconType } from "$lib/components/icons";
import type { PageInfo } from "$lib/gql/graphql";
import type { Component } from "svelte";

export type TableProps<T extends Record<string, unknown>> = {
  items: T[];
  columns: TableColumnProps<T>[];
  tableClass?: string;
  pagination?: PageInfo;
  onNextPagelick?: (afterCursor: string) => void;
  onPreviousPagelick?: (beforeCursor: string) => void;
  onChangeRowsPerPage?: (no: number) => void;
  rowsOptions?: number[];
};

export type TableColumnProps<T extends Record<string, unknown>> = {
  title: string;
  startIcon?: IconType;
  endIcon?: IconType;
  sortable?: boolean;
  getter: (item: T) => string | number | Component;
};

