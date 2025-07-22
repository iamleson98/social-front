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

export const SHIPPING_ZONE_DETAIL_QUERY = gql`
query ShippingZone($id: ID!, $channel: String) {
  shippingZone(id: $id, channel: $channel) {
    id
    name
    default
    channels {
      id
      name
      slug
    }
    metadata {
      key
      value
    }
    privateMetadata {
      key
      value
    }
    countries {
      code
      country
    }
    warehouses {
      id
      name
      slug
    }
    shippingMethods {
      id
      maximumOrderPrice {
        amount
        currency
      }
      minimumOrderPrice {
        amount
        currency
      }
      postalCodeRules {
        id
        start 
        end
        inclusionType
      }
      taxClass {
        id
        name
      }
      metadata {
        key
        value
      }
      privateMetadata {
        key
        value
      }
      minimumOrderWeight {
        unit
        value
      }
      maximumOrderWeight {
        unit
        value
      }
      minimumDeliveryDays
      maximumDeliveryDays
      name
      description
      type
      channelListings {
        id
        channel {
          id
          name
          currencyCode
        }
        price {
          amount
          currency
        }
        minimumOrderPrice {
          amount
          currency
        }
        maximumOrderPrice {
          amount
          currency
        }
      }
    }
  }
}`;

export const DELETE_SHIPPING_ZONE_MUTATION = gql`
mutation ShippingZoneDelete($id: ID!) {
  shippingZoneDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;
