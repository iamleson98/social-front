import { gql } from "@urql/core";


export const SHIPPING_ZONES_QUERY = gql`
query ShippingZones($channel: String, $filter: ShippingZoneFilterInput, $before: String, $after: String, $first: Int, $last: Int) {
  shippingZones(channel: $channel, filter: $filter, before: $before, after: $after, first: $first, last: $last) {
    edges {
      node {
        id
        name
        countries {
          code
          country
        }
      }
    }
  }
}`;

export const WAREHOUSE_SHIPPING_ZONES_QUERY = gql`
query ShippingZones($id: ID!, $before: String, $after: String, $first: Int, $last: Int) {
  warehouse(id: $id) {
    shippingZones(before: $before, after: $after, first: $first, last: $last) {
      edges {
        node {
          id
          name
          # countries {
          #   code
          #   country
          # }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
}`;