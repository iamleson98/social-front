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
          # totalCharged
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

export const ORDER_DETAIL_QUERY = gql`
  query OrderDetail($id: ID!) {
    order(id: $id) {
      id
      number
      created
      chargeStatus
      status
      paymentStatus
      userEmail
      customerNote

      billingAddress {
        firstName
        lastName
        streetAddress1
        city
        postalCode
        country {
          country
        }
      }

      shippingAddress {
        firstName
        lastName
        streetAddress1
        city
        postalCode
        country {
          country
        }
      }

      shippingMethodName
      subtotal {
        gross {
          amount
          currency
        }
      }
      shippingPrice {
        gross {
          amount
          currency
        }
      }
      total {
        gross {
          amount
          currency
        }
      }

      lines {
        id
        quantity
        unitPrice {
          gross {
            amount
            currency
          }
        }
        totalPrice {
          gross {
            amount
            currency
          }
        }
        productName
        productSku
        variantName
        thumbnail {
          url
        }
      }
    }

    shop {
      countries {
        code
        country
      }
      defaultWeightUnit
      fulfillmentAllowUnpaid
      fulfillmentAutoApprove
    }
  }
`;


export const ORDER_UPDATE_MUTATION = gql`
mutation OrderUpdate($id: ID!, $input: OrderUpdateInput!) {
  orderUpdate(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const ORDER_DELETE_MUTATION = gql`
mutation OrderDelete($id: ID!) {
  orderDelete(id: $id) {
    errors {
      field
      message
    }
  }
}`;

