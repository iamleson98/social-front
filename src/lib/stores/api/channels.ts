import { gql } from "@urql/core";

export const CHANNEL_QUERY_STORE = gql`query Channels {
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
  }
}`;
