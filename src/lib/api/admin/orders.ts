import { gql } from "@urql/core";


export const SHOP_ORDERS_QUERY = gql`
query ShopOrders($first: Int, $after: String, $last: Int, $before: String) {
  orders(first: $first, after: $after, last: $last, before: $before) {
    edges {
      node {
        id
        created
        chargeStatus
        status
        number
        paymentStatus
        userEmail
        total {
          gross {
            amount
            currency
          }
        }
        # totalCharged {
        #   currency
        #   amount
        # }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}`;
