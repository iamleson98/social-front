import { gql } from "@urql/core";

/**
 * NOTE: the main orders API requires Staff account, so this is a workaround
 */
export const USER_ORDERS_QUERY = gql`
query GetOrdersOfUser($first: Int, $after: String, $last: Int, $before: String) {
  me {
    orders(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
          created
          chargeStatus
          status
          number
          paymentStatus
          total {
            gross {
              amount
              currency
            }
          }
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
}
`;
