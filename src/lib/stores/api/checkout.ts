import { gql } from '@urql/core';

export const CHECKOUT_CREATE_MUTATION = gql`
  mutation CheckoutCreate($channel: String!) {
    checkoutCreate(input: { channel: $channel, lines: [] }) {
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
query CheckoutFind($id: ID!) {
	checkout(id: $id) {
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
}`;

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
