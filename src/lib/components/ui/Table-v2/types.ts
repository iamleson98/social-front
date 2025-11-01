import type { ColumnDef } from "@tanstack/table-core";
import type { RowOptions } from "../Table/types";

export type TableProps<T extends Record<string, unknown>, K extends string = string> = {
  items: T[];
  columns: ColumnDef<T, unknown>[];
  className?: string;
  rowsPerPage?: RowOptions;
	onChangeRowsPerPage?: (num: RowOptions) => void;
	disabled?: boolean;
};

