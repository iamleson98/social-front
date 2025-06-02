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
  query OrderHistory($id: ID!) {
    order(id: $id) {
      events {
        id
        date
        type
        message
        discount {
          amount {
            amount
            currency
          }
          reason
        }
        user {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const ORDER_ADD_NOTE_MUTATION = gql`
mutation OrderAddNote($id: ID!, $input: OrderAddNoteInput!) {
  orderAddNote(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

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
        phone
        companyName
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
        phone
        companyName
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
