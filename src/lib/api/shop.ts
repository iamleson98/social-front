import { gql } from "@urql/core";

// NOTE: this query requires authenticated staff user to get channelCurrencies
// so you must check for isStaffUser
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
    channelCurrencies @include(if: $isStaffUser)
    fulfillmentAutoApprove
    fulfillmentAllowUnpaid
  }
}`
