import { gql } from "@urql/core";

export const QUERY_WAREHOUSES = gql`
query Warehouses($first: Int, $before: String, $after: String, $last: Int, $filter: WarehouseFilterInput, $sortBy: WarehouseSortingInput) {
  warehouses(first: $first, after: $after, before: $before, filter: $filter, sortBy: $sortBy) {
    edges {
      node {
        id
        name
        # shippingZones {
        #   edgs {
        #     node {
        #       id
        #       name
        #     }
        #   }
        # }
      }
    }
  }
}`;
