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
  # $languageCode: LanguageCodeEnum!
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
        # translation(languageCode: $languageCode) {
        #   name
        # }
        attributes(variantSelection: ALL) {
          values {
            name
            dateTime
            boolean
            # translation(languageCode: $languageCode) {
            #   name
            # }
          }
        }
        product {
          name
          slug
          # translation(languageCode: $languageCode) {
          #   language {
          #     code
          #   }
          #   id
          #   name
          # }
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
  # $languageCode: LanguageCodeEnum!
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
    # user {
    #   id
    #   email
    # }
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
        # translation(languageCode: $languageCode) {
        #   name
        # }
        attributes(variantSelection: ALL) {
          values {
            name
            dateTime
            boolean
            # translation(languageCode: $languageCode) {
            #   name
            # }
          }
        }
        product {
          name
          # translation(languageCode: $languageCode) {
          #   language {
          #     code
          #   }
          #   id
          #   name
          # }
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
  # $languageCode: LanguageCodeEnum!
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
      # user {
      #   id
      #   email
      # }
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
          # translation(languageCode: $languageCode) {
          #   name
          # }
          attributes(variantSelection: ALL) {
            values {
              name
              dateTime
              boolean
              # translation(languageCode: $languageCode) {
              #   name
              # }
            }
          }
          product {
            name
            slug
            # translation(languageCode: $languageCode) {
            #   language {
            #     code
            #   }
            #   id
            #   name
            # }
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
          # translation(languageCode: $languageCode) {
          #   name
          # }
          attributes(variantSelection: ALL) {
            values {
              name
              dateTime
              boolean
              # translation(languageCode: $languageCode) {
              #   name
              # }
            }
          }
          product {
            name
            slug
            # translation(languageCode: $languageCode) {
            #   language {
            #     code
            #   }
            #   id
            #   name
            # }
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
          # translation(languageCode: $languageCode) {
          #   name
          # }
          attributes(variantSelection: ALL) {
            values {
              name
              dateTime
              boolean
              # translation(languageCode: $languageCode) {
              #   name
              # }
            }
          }
          product {
            name
            slug
            # translation(languageCode: $languageCode) {
            #   language {
            #     code
            #   }
            #   id
            #   name
            # }
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
