import { gql } from "@urql/core";


/** only authenticated users can call this query */
export const CHANNELS_QUERY = gql`
query Channels {
  channels {
    id
    name
    slug
    isActive
    currencyCode
    defaultCountry {
      code
      country
    }
    stockSettings {
      allocationStrategy
    }
    warehouses {
      id
      name
    }
  }
}`;

export const CHANNEL_DETAILS_QUERY = gql`
query Channel($slug: String, $id: ID) {
  channel(slug: $slug, id: $id) {
    countries {
      code
      country
    }
    defaultCountry {
      code
      country
    }
    id
    name
    slug
    isActive
    currencyCode
    orderSettings {
      allowUnpaidOrders
      deleteExpiredOrdersAfter
      markAsPaidStrategy
    }
    checkoutSettings {
      automaticallyCompleteFullyPaidCheckouts
    }
    paymentSettings {
      defaultTransactionFlowStrategy
    }
    stockSettings {
      allocationStrategy
    }
  }
}
`;
