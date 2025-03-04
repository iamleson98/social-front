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

export const CHANNEL_DETAILS_QUERY_STORE = gql`
query Channel($slug: String!) {
  channel(slug: $slug) {
    countries {
      code
      country
    }
  }
}
`;
