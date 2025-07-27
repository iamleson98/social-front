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
    description
    channels {
      id
      name
      slug
      currencyCode
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

export const DELETE_SHIPPING_METHOD_MUTATION = gql`
mutation DeleteShippingMethod($id: ID!) {
  shippingPriceDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;

export const UPDATE_SHIPPING_ZONE_MUTATION = gql`
mutation UpdateShippingZone($id: ID!, $input: ShippingZoneUpdateInput!) {
  shippingZoneUpdate(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const CREATE_SHIPPING_METHOD_MUTATION = gql`
mutation CreateShippingMethod($input: ShippingPriceInput!) {
  shippingPriceCreate(input: $input) {
    errors {
      field
      message
    }
    shippingMethod {
      id
    }
  }
}`;

export const SHIPPING_METHOD_UPDATE_MUTATION = gql`
mutation UpdateShippingMethod($id: ID!, $input: ShippingPriceInput!) {
  shippingPriceUpdate(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const SHIPPING_METHOD_CHANNEL_LISTING_UPDATE_MUTATION = gql`
mutation UpdateShippingMethodChannelListing($id: ID!, $input: ShippingMethodChannelListingInput!) {
  shippingMethodChannelListingUpdate(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const SHIPPING_ZONE_CREATE_MUTATION = gql`
mutation CreateShippingZone($input: ShippingZoneCreateInput!) {
  shippingZoneCreate(input: $input) {
    errors {
      field
      message
    }
    shippingZone {
      id
    }
  }
}`;
