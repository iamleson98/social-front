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
      statusDisplay
      userEmail
      customerNote
      channel {
        id
        name
        currencyCode
        slug
        defaultCountry {
          code
        }
        orderSettings {
          markAsPaidStrategy
        }
        isActive
      }
      billingAddress {
        id
        firstName
        lastName
        streetAddress1
        streetAddress2
        city
        postalCode
        country {
          code
          country
        }
        countryArea
        phone
        companyName
        cityArea
      }
      shippingAddress {
        id
        firstName
        lastName
        streetAddress1
        streetAddress2
        city
        postalCode
        countryArea
        country {
          code
          country
        }
        phone
        companyName
        cityArea
      }
      totalRemainingGrant {
        amount
        currency
      }
      totalGrantedRefund {
        amount
        currency
      }
      totalRefundPending {
        amount
        currency
      }
      totalRefunded {
        amount
        currency
      }
      totalAuthorizePending {
        amount
        currency
      }
      totalAuthorized {
        amount
        currency
      }
      totalCaptured {
        amount
        currency
      }
      totalCharged {
        amount
        currency
      }
      totalChargePending {
        amount
        currency
      }
      totalCancelPending {
        amount
        currency
      }
      totalBalance {
        amount
        currency
      }
      undiscountedTotal {
        gross {
          amount
          currency
        }
        net {
          amount
          currency
        }
      }
      totalCanceled {
        amount
        currency
      }
      actions
      shippingMethodName
      subtotal {
        gross {
          amount
          currency
        }
        net {
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
        net {
          amount
          currency
        }
        tax {
          amount
          currency
        }
      }
      lines {
        id
        isShippingRequired
        quantity
        isGift
        quantityFulfilled
        quantityToFulfill
        unitPrice {
          gross {
            amount
            currency
          }
          net {
            amount
            currency
          }
        }
        unitDiscount {
          amount
          currency
        }
        unitDiscountValue
        unitDiscountReason
        unitDiscountType
        undiscountedUnitPrice {
          currency
          gross {
            amount
            currency
          }
          net {
            amount
            currency
          }
        }
        totalPrice {
          gross {
            amount
            currency
          }
          net {
            amount
            currency
          }
        }
        productName
        productSku
        variantName
        thumbnail {
          url
          alt
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
      availablePaymentGateways {
        name
        id
      }
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

export const ORDER_LINES_METADATA_QUERY = gql`
query OrderLinesMetadata($id: ID!, $hasManageProducts: Boolean!) {
  order(id: $id) {
    lines {
      id
      productName
      productSku
      quantity
      thumbnail {
        url
        alt
      }
      variant {
        id
        name
        metadata {
          key
          value
        }
        privateMetadata @include(if: $hasManageProducts) {
          key
          value
        }
      }
      metadata {
        key
        value
      }
      privateMetadata {
        key
        value
      }
    }
  }
}`;
