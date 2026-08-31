import { gql } from '@urql/core';

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

/** Order detail for the logged-in customer (owner access). Used by orders/[id] page */
export const CUSTOMER_ORDER_QUERY = gql`
	query CustomerOrder($id: ID!) {
		order(id: $id) {
			id
			number
			created
			status
			statusDisplay
			paymentStatus
			chargeStatus
			isPaid
			isShippingRequired
			customerNote
			total {
				gross {
					amount
					currency
				}
				tax {
					amount
					currency
				}
			}
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
			discounts {
				name
				amount {
					amount
					currency
				}
			}
			voucherCode
			giftCards {
				displayCode
				currentBalance {
					amount
					currency
				}
			}
			shippingAddress {
				firstName
				lastName
				companyName
				streetAddress1
				streetAddress2
				city
				cityArea
				countryArea
				postalCode
				phone
				country {
					country
					code
				}
			}
			lines {
				id
				productName
				variantName
				productSku
				quantity
				quantityFulfilled
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
				thumbnail(size: 128, format: WEBP) {
					url
					alt
				}
				variant {
					id
					product {
						slug
					}
				}
			}
			fulfillments {
				id
				status
				trackingNumber
				created
			}
		}
	}
`;
