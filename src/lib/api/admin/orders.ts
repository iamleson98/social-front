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

export const PRODUCT_VARIANT_FRAGMENT = gql`
fragment ProductVariantFragment on ProductVariant {
  id
  name
  quantityAvailable
  preorder {
    endDate
  }
  stocks {
    id
    quantity
    quantityAllocated
    warehouse {
      id
      name
    }
  }
  product {
    id
    isAvailableForPurchase
  }
}
`;

export const ORDER_LINE_FRAGMENT = gql`
fragment OrderLineFragment on OrderLine {
  metadata {
    key
    value
  }
  privateMetadata {
    key
    value
  }
  id
  isShippingRequired
  productName
  productSku
  isGift
  quantity
  quantityFulfilled
  quantityToFulfill
  totalPrice {
    net {
      amount
      currency
    }
    gross {
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
  thumbnail {
    url
    alt
  }
  variant {
    ...ProductVariantFragment
  }
  allocations {
    id
    quantity
    warehouse {
      id
      name
    }
  }
}
${PRODUCT_VARIANT_FRAGMENT}
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
      statusDisplay
      userEmail
      customerNote
<<<<<<< HEAD
      totalAuthorized {
        amount
        currency
      }
      totalCaptured {
        amount
        currency
=======
      metadata {
        key
        value
      }
      privateMetadata {
        key
        value
      }
      fulfillments {
        id
        metadata {
          key
          value
        }
        privateMetadata {
          key
          value
        }
        fulfillmentOrder
        status
        trackingNumber
        warehouse {
          id
          name
        }
        lines {
          id
          quantity
          orderLine {
            ...OrderLineFragment
          }
        }
      }
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
>>>>>>> 3ff1636be42144baac7feec452fc3f6015516b29
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
        ...OrderLineFragment
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
  ${ORDER_LINE_FRAGMENT}
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

export const ORDER_CANCEL_FULFILLMENT_MUTATION = gql`
mutation OrderCancelFulfillment($id: ID!, $input: FulfillmentCancelInput!) {
  orderFulfillmentCancel(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const ORDER_FULFILL_MUTATION = gql`
mutation OrderFulfill($id: ID!, $input: OrderFulfillInput!) {
  orderFulfill(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;
