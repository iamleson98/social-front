import { gql } from '@urql/core';

export const CHECKOUT_CREATE_MUTATION = gql`
  mutation CheckoutCreate($channel: String!, $lines: [CheckoutLineInput!]!) {
    checkoutCreate(input: { channel: $channel, lines: $lines }) {
      checkout {
        id
        email
        lines {
          id
          quantity
          totalPrice {
            gross {
              amount
              currency
            }
          }
          variant {
            product {
              id
              name
              slug
              thumbnail {
                url
                alt
              }
              category {
                name
              }
            }
            pricing {
              price {
                gross {
                  amount
                  currency
                }
              }
            }
            name
            id
          }
        }
        totalPrice {
          gross {
            amount
            currency
          }
        }
      }
      errors {
        field
        code
      }
    }
  }
`;

export const CHECKOUT_FIND_QUERY = gql`
query Checkout($id: ID!, $languageCode: LanguageCodeEnum!) {
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
    user {
      id
      email
    }
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
        translation(languageCode: $languageCode) {
          name
        }
        attributes(variantSelection: ALL) {
          values {
            name
            dateTime
            boolean
            translation(languageCode: $languageCode) {
              name
            }
          }
        }
        product {
          name
          translation(languageCode: $languageCode) {
            language {
              code
            }
            id
            name
          }
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

export const CHECKOUT_ADD_LINE_MUTATION = gql`
mutation CheckoutAddLine($checkoutID: ID!, $productVariantId: ID!, $quantity: Int!) {
	checkoutLinesAdd(id: $checkoutID, lines: [{ quantity: $quantity, variantId: $productVariantId }]) {
		checkout {
			id
			lines {
				id
				quantity
				variant {
					name
					product {
						name
					}
				}
			}
		}
		errors {
			message
		}
	}
}`;
