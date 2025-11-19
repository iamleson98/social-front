export { default as Table } from './table.svelte';
export { default as TableSkeleton } from './table-skeleton.svelte';
import { default as GraphqlPaginableTable } from './graphql-paginable-table.svelte';
export * from './types';

/**
 * When parent component use GraphqlPaginableTable, 
 * it define a reference prop with type of this type.
 * This would make it type-safe when you can to call some internal methods of GraphqlPaginableTable.
 */
export type GraphqlPaginableTableInterface = ReturnType<typeof GraphqlPaginableTable>;
export { GraphqlPaginableTable };
