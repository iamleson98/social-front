import { gql } from "@urql/core";

export const SHOP_QUERY = gql`
query Shop {
  shop {
    id
    countries {
      code
      country
    }
    languages {
      code
      language
    }
  }
}`
