import { gql } from '@urql/core';

export const CHECKOUT_CREATE_MUTATION = gql`
  mutation CheckoutCreate($channel: String!, $lines: [CheckoutLineInput!]!) {
    checkoutCreate(input: { channel: $channel, lines: $lines }) {
      checkout {
        id
        email
        lines {
          id
        }
      }
      errors {
        field
        code
      }
    }
  }
`;


/** this query should be used by shopping-cart page */
export const CHECKOUT_PREVIEW_QUERY = gql`
query CheckoutPreview(
  $id: ID!, 
) {
  checkout(id: $id) {
    id
    isShippingRequired
    totalPrice {
      gross {
        currency
        amount
      }
      tax {
        currency
        amount
      }
    }
    subtotalPrice {
      gross {
        currency
        amount
      }
    }
    lines {
      id
      quantity
      totalPrice {
        gross {
          currency
          amount
        }
      }
      undiscountedTotalPrice {
        currency
        amount
      }
      unitPrice {
        gross {
          currency
          amount
        }
      }
      undiscountedUnitPrice {
        currency
        amount
      }
      variant {
        id
        name
        quantityAvailable
        quantityLimitPerCustomer
        attributes(variantSelection: ALL) {
          values {
            name
            dateTime
            boolean
          }
        }
        product {
          name
          slug
          media {
            alt
            type
            url(size: 100, format: WEBP)
          }
        }
        media {
          alt
          type
          url(size: 100, format: WEBP)
        }
      }
    }
  }
}`;

/** should be used in checkout detail page  */
export const CHECKOUT_DETAILS_QUERY = gql`
query CheckoutDetails(
  $id: ID!, 
) {
  checkout(id: $id) {
    id
    email
    discount {
      amount
      currency
    }
    voucherCode
    discountName
    translatedDiscountName
    giftCards {
      displayCode
      id
      currentBalance {
        currency
        amount
      }
    }
    channel {
      id
      slug
    }
    shippingAddress {
      id
      firstName
      lastName
      city
      phone
      postalCode
      companyName
      cityArea
      streetAddress1
      streetAddress2
      countryArea
      country {
        country
        code
      }
    }
    billingAddress {
      id
      firstName
      lastName
      city
      phone
      postalCode
      companyName
      cityArea
      streetAddress1
      streetAddress2
      countryArea
      country {
        country
        code
      }
    }
    authorizeStatus
    chargeStatus
    isShippingRequired
    availablePaymentGateways {
      id
      name
      currencies
      config {
        field
        value
      }
    }
    deliveryMethod {
      __typename
    }
    shippingMethods {
      id
      name
      price {
        amount
        currency
      }
      maximumDeliveryDays
      minimumDeliveryDays
    }
    totalPrice {
      gross {
        currency
        amount
      }
      tax {
        currency
        amount
      }
    }
    shippingPrice {
      gross {
        currency
        amount
      }
    }
    subtotalPrice {
      gross {
        currency
        amount
      }
    }
    lines {
      id
      quantity
      totalPrice {
        gross {
          currency
          amount
        }
      }
      unitPrice {
        gross {
          currency
          amount
        }
      }
      undiscountedUnitPrice {
        currency
        amount
      }
      variant {
        id
        name
        attributes(variantSelection: ALL) {
          values {
            name
            dateTime
            boolean
          }
        }
        product {
          name
          media {
            alt
            type
            url(size: 100, format: WEBP)
          }
        }
        media {
          alt
          type
          url(size: 100, format: WEBP)
        }
      }
    }
  }
}
`;

/** Chould be used in product detail page, when user click `Add to cart` button  */
export const CHECKOUT_ADD_LINE_MUTATION = gql`
mutation CheckoutAddLine($id: ID!, $lines: [CheckoutLineInput!]!) {
	checkoutLinesAdd(id: $id, lines: $lines) {
		checkout {
			id
			lines {
				id
			}
		}
		errors {
			message
		}
	}
}`;

export const CHECKOUT_REMOVE_PROMO_CODE_MUTATION = gql`
mutation CheckoutRemovePromoCode(
  $checkoutId: ID
  $promoCode: String
  $promoCodeId: ID
) {
  checkoutRemovePromoCode(checkoutId: $checkoutId, promoCode: $promoCode, promoCodeId: $promoCodeId) {
    errors {
      message
      field
      code
    }
    checkout {
      id
      email
      discount {
        amount
        currency
      }
      voucherCode
      discountName
      translatedDiscountName
      giftCards {
        displayCode
        id
        currentBalance {
          currency
          amount
        }
      }
      channel {
        id
        slug
      }
      shippingAddress {
        id
        firstName
        lastName
        city
        phone
        postalCode
        companyName
        cityArea
        streetAddress1
        streetAddress2
        countryArea
        country {
          country
          code
        }
      }
      billingAddress {
        id
        firstName
        lastName
        city
        phone
        postalCode
        companyName
        cityArea
        streetAddress1
        streetAddress2
        countryArea
        country {
          country
          code
        }
      }
      authorizeStatus
      chargeStatus
      isShippingRequired
      availablePaymentGateways {
        id
        name
        currencies
        config {
          field
          value
        }
      }
      deliveryMethod {
        __typename
      }
      shippingMethods {
        id
        name
        price {
          amount
          currency
        }
        maximumDeliveryDays
        minimumDeliveryDays
      }
      totalPrice {
        gross {
          currency
          amount
        }
        tax {
          currency
          amount
        }
      }
      shippingPrice {
        gross {
          currency
          amount
        }
      }
      subtotalPrice {
        gross {
          currency
          amount
        }
      }
      lines {
        id
        quantity
        totalPrice {
          gross {
            currency
            amount
          }
        }
        unitPrice {
          gross {
            currency
            amount
          }
        }
        undiscountedUnitPrice {
          currency
          amount
        }
        variant {
          id
          name
          quantityLimitPerCustomer
          quantityAvailable
          attributes(variantSelection: ALL) {
            values {
              name
              dateTime
              boolean
            }
          }
          product {
            name
            slug
            media {
              alt
              type
              url(size: 100, format: WEBP)
            }
          }
          media {
            alt
            type
            url(size: 100, format: WEBP)
          }
        }
      }
    }
  }
}
`;

export const CHECKOUT_LINES_UPDATE_MUTATION = gql`
mutation CheckoutLinesUpdate($lines: [CheckoutLineUpdateInput!]!, $id: ID!) {
  checkoutLinesUpdate(lines: $lines, id: $id) {
    checkout {
      id
      isShippingRequired
      totalPrice {
        gross {
          currency
          amount
        }
        tax {
          currency
          amount
        }
      }
      shippingPrice {
        gross {
          currency
          amount
        }
      }
      subtotalPrice {
        gross {
          currency
          amount
        }
      }
      lines {
        id
        quantity
        totalPrice {
          gross {
            currency
            amount
          }
        }
        undiscountedTotalPrice {
          currency
          amount
        }
        unitPrice {
          gross {
            currency
            amount
          }
        }
        undiscountedUnitPrice {
          currency
          amount
        }
        variant {
          id
          name
          quantityAvailable
          quantityLimitPerCustomer
          attributes(variantSelection: ALL) {
            values {
              name
              dateTime
              boolean
            }
          }
          product {
            name
            slug
            media {
              alt
              type
              url(size: 100, format: WEBP)
            }
          }
          media {
            alt
            type
            url(size: 100, format: WEBP)
          }
        }
      }
    }
    errors {
      message
      field
    }
  }
}`;

export const CHECKOUT_LINES_DELETE_MUTATION = gql`
mutation CheckoutLineDelete($linesIds: [ID!]!, $id: ID!) {
  checkoutLinesDelete(linesIds: $linesIds, id: $id) {
    errors {
      message
      field
    }
    checkout {
      id
      isShippingRequired
      totalPrice {
        gross {
          currency
          amount
        }
        tax {
          currency
          amount
        }
      }
      shippingPrice {
        gross {
          currency
          amount
        }
      }
      subtotalPrice {
        gross {
          currency
          amount
        }
      }
      lines {
        id
        quantity
        totalPrice {
          gross {
            currency
            amount
          }
        }
        undiscountedTotalPrice {
          currency
          amount
        }
        unitPrice {
          gross {
            currency
            amount
          }
        }
        undiscountedUnitPrice {
          currency
          amount
        }
        variant {
          id
          name
          quantityAvailable
          quantityLimitPerCustomer
          attributes(variantSelection: ALL) {
            values {
              name
              dateTime
              boolean
            }
          }
          product {
            name
            slug
            media {
              alt
              type
              url(size: 100, format: WEBP)
            }
          }
          media {
            alt
            type
            url(size: 100, format: WEBP)
          }
        }
      }
    }
  }
}`;

export const CHECKOUT_SHIPPING_ADDRESS_UPDATE_MUTATION = gql`
mutation CheckoutShippingAddressUpdate(
  $id: ID!
	$shippingAddress: AddressInput!
	$validationRules: CheckoutAddressValidationRules
) {
  checkoutShippingAddressUpdate(
    id: $id
		shippingAddress: $shippingAddress
		validationRules: $validationRules
  ) {
    checkout {
      id
      email
      discount {
        amount
        currency
      }
      voucherCode
      discountName
      translatedDiscountName
      giftCards {
        displayCode
        id
        currentBalance {
          currency
          amount
        }
      }
      channel {
        id
        slug
      }
      shippingAddress {
        id
        firstName
        lastName
        city
        phone
        postalCode
        companyName
        cityArea
        streetAddress1
        streetAddress2
        countryArea
        country {
          country
          code
        }
      }
      authorizeStatus
      chargeStatus
      isShippingRequired
      availablePaymentGateways {
        id
        name
        currencies
        config {
          field
          value
        }
      }
      deliveryMethod {
        __typename
      }
      shippingMethods {
        id
        name
        price {
          amount
          currency
        }
        maximumDeliveryDays
        minimumDeliveryDays
      }
      totalPrice {
        gross {
          currency
          amount
        }
        tax {
          currency
          amount
        }
      }
      shippingPrice {
        gross {
          currency
          amount
        }
      }
      subtotalPrice {
        gross {
          currency
          amount
        }
      }
      lines {
        id
        quantity
        totalPrice {
          gross {
            currency
            amount
          }
        }
        unitPrice {
          gross {
            currency
            amount
          }
        }
        undiscountedUnitPrice {
          currency
          amount
        }
        variant {
          id
          name
          attributes(variantSelection: ALL) {
            values {
              name
              dateTime
              boolean
            }
          }
          product {
            name
            media {
              alt
              type
              url(size: 100, format: WEBP)
            }
          }
          media {
            alt
            type
            url(size: 100, format: WEBP)
          }
        }
      }
    }
    errors {
      field
      code
    }
  }
}`;

export const CHECKOUT_BILLING_ADDRESS_UPDATE_MUTATION = gql`
mutation CheckoutBillingAddressUpdate(
  $id: ID!
	$billingAddress: AddressInput!
	$validationRules: CheckoutAddressValidationRules
) {
  checkoutBillingAddressUpdate(
    id: $id
		billingAddress: $billingAddress
		validationRules: $validationRules
  ) {
    checkout {
      id
      email
      discount {
        amount
        currency
      }
      voucherCode
      discountName
      translatedDiscountName
      giftCards {
        displayCode
        id
        currentBalance {
          currency
          amount
        }
      }
      channel {
        id
        slug
      }
      billingAddress {
        id
        firstName
        lastName
        city
        phone
        postalCode
        companyName
        cityArea
        streetAddress1
        streetAddress2
        countryArea
        country {
          country
          code
        }
      }
      authorizeStatus
      chargeStatus
      isShippingRequired
      availablePaymentGateways {
        id
        name
        currencies
        config {
          field
          value
        }
      }
      deliveryMethod {
        __typename
      }
      shippingMethods {
        id
        name
        price {
          amount
          currency
        }
        maximumDeliveryDays
        minimumDeliveryDays
      }
      totalPrice {
        gross {
          currency
          amount
        }
        tax {
          currency
          amount
        }
      }
      shippingPrice {
        gross {
          currency
          amount
        }
      }
      subtotalPrice {
        gross {
          currency
          amount
        }
      }
      lines {
        id
        quantity
        totalPrice {
          gross {
            currency
            amount
          }
        }
        unitPrice {
          gross {
            currency
            amount
          }
        }
        undiscountedUnitPrice {
          currency
          amount
        }
        variant {
          id
          name
          attributes(variantSelection: ALL) {
            values {
              name
              dateTime
              boolean
            }
          }
          product {
            name
            media {
              alt
              type
              url(size: 100, format: WEBP)
            }
          }
          media {
            alt
            type
            url(size: 100, format: WEBP)
          }
        }
      }
    }
    errors {
      field
      code
    }
  }
}`;
