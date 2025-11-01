import type { ColumnDef } from "@tanstack/table-core";

export type TableProps<T extends Record<string, unknown>, K extends string = string> = {
  items: T[];
  columns: ColumnDef<T, unknown>[];
  className?: string;
};
