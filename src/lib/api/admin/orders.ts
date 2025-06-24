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
mutation OrderAddNote($order: ID!, $input: OrderAddNoteInput!) {
  orderAddNote(order: $order, input: $input) {
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
    slug
  }
  preorder {
    globalThreshold
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
      isPaid
      user {
        id
      }
      invoices {
        id
        number
        message
        url
      }
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
query OrderLinesMetadata($id: ID!, $hasManageProductPerms: Boolean!) {
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
        privateMetadata @include(if: $hasManageProductPerms) {
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
mutation OrderFulfill($order: ID!, $input: OrderFulfillInput!) {
  orderFulfill(order: $order, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const ORDER_FULFILLMENT_UPDATE_TRACKING_MUTATION = gql`
mutation OrderFulfillmentUpdateTracking($id: ID!, $input: FulfillmentUpdateTrackingInput!) {
  orderFulfillmentUpdateTracking(id: $id, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const ORDER_INVOICE_CREATE_MUTATION = gql`
mutation InvoiceCreate($orderId: ID!, $input: InvoiceCreateInput!) {
  invoiceCreate(orderId: $orderId, input: $input) {
    errors {
      field
      message
    }
  }
}`;

export const VARIANTS_FOR_ORDER_QUERY = gql`
query products($channel: String!, $first: Int, $after: String, $last: Int, $before: String, $filter: ProductFilterInput, $address: AddressInput) {
  products(first: $first, after: $after, last: $last, before: $before, channel: $channel, filter: $filter) {
    edges {
      node {
        id
        name
        slug
        thumbnail {
          url
          alt
        }
        variants {
          id
          name
          sku
          pricing(address: $address) {
            priceUndiscounted {
              gross {
                amount
                currency
              }
            }
            price {
              gross {
                amount
                currency
              }
            }
            onSale
          }
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  }
}`;

export const CREATE_DRAFT_ORDER_MUTATION = gql`
mutation CreateDraftOrder($input: DraftOrderCreateInput!) {
  draftOrderCreate(input: $input) {
    errors {
      field
      message
    }
  }
}`;
