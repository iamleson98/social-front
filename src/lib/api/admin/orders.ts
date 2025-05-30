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
    # totalCount
  }
}`;

export const CUSTOMER_ORDERS_QUERY = gql`
query User($id: ID!, $first: Int, $after: String, $last: Int, $before: String) {
  user(id: $id) {
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
}`;

export const ORDER_HISTORY_QUERY = gql`
query OrderHistory($id: ID!, $filter: OrderHistoryFilterInput) {
  order(id: $id) {
    events(filter: $filter) {
      id
      expiryDate
      oldExpiryDate
      date
      type
      message
      email
      orderId
      orderNumber
      tags
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
}`;

export const ORDER_ADD_NOTE_MUTATION = gql`
mutation OrderAddNote($id: ID!, $input: OrderAddNoteInput!) {
  orderAddNote(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

