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
    permissions {
      code
      name
    }
    companyAddress {
      phone
      companyName
      streetAddress1
      streetAddress2
      cityArea
      city
      postalCode
      isDefaultShippingAddress
      isDefaultBillingAddress
      countryArea
      firstName
      lastName
      metadata {
        key
        value
      }
      country {
        code
        country
      }
    }
    channelCurrencies @include(if: $isStaffUser)
    fulfillmentAutoApprove
    fulfillmentAllowUnpaid
    reserveStockDurationAnonymousUser
    reserveStockDurationAuthenticatedUser
    limitQuantityPerCheckout
    enableAccountConfirmationByEmail
  }
}`;
