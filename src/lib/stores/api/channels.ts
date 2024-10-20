import { gql } from "@urql/core";

export const CHANNELS_QUERY_STORE = gql`
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
  }
}`;

export const CHANNEL_DETAILS_QUERY_STORE = gql`
query Channel($slug: String!) {
  channel(slug: $slug) {
    countries {
      code
    }
  }
}
`;
