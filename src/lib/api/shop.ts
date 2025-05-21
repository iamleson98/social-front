import { gql } from "@urql/core";

export const SHOP_QUERY = gql`
query Shop($isStaffUser: Boolean = false) {
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
    
    # NOTE: this field requires authenticated staff user, so we must check for it
    channelCurrencies @include(if: $isStaffUser)
  }
}`
