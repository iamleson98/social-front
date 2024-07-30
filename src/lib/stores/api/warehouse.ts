import { gql } from "@urql/core";

export const WarehousesQuery = gql`
query Warehouses($first: Int, $after: Int, $before: String, $after: String, $filter: WarehouseFilterInput, $sort: WarehouseSortingInput) {
  warehouses(first: $first, after: $after, before: $before, filter: $filter, sort: $sort) {
    edges {
      node {
        id
        name
        shippingZones {
          edgs {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
}`;
