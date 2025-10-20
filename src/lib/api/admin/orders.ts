import { gql } from '@urql/core';

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
		}
	}
`;

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
	}
`;

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
	}
`;

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
			transactions {
				id
				message
				name
				events {
					type
					amount {
						amount
						currency
					}
					createdBy {
						... on User {
							avatar {
								alt
								url
							}
							email
						}
					}
					createdAt
					pspReference
					message
				}
				actions
				cancelPendingAmount {
					amount
					currency
				}
				canceledAmount {
					amount
					currency
				}
				refundPendingAmount {
					amount
					currency
				}
				refundedAmount {
					amount
					currency
				}
				chargePendingAmount {
					amount
					currency
				}
				chargedAmount {
					amount
					currency
				}
				authorizePendingAmount {
					amount
					currency
				}
				authorizedAmount {
					amount
					currency
				}
			}
			payments {
				id
				isActive
				partial
			}
			grantedRefunds {
				id
				reason
			}
			discounts {
				id
				type
				name
				valueType
				value
				reason
				total {
					amount
					currency
				}
			}
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
			shippingMethods {
				name
				id
				active
				price {
					amount
					currency
				}
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
			deliveryMethod {
				... on ShippingMethod {
					id
				}
				... on Warehouse {
					id
				}
			}
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
	}
`;

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
	}
`;

export const ORDER_CANCEL_FULFILLMENT_MUTATION = gql`
	mutation OrderCancelFulfillment($id: ID!, $input: FulfillmentCancelInput!) {
		orderFulfillmentCancel(id: $id, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_FULFILL_MUTATION = gql`
	mutation OrderFulfill($order: ID!, $input: OrderFulfillInput!) {
		orderFulfill(order: $order, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_FULFILLMENT_UPDATE_TRACKING_MUTATION = gql`
	mutation OrderFulfillmentUpdateTracking($id: ID!, $input: FulfillmentUpdateTrackingInput!) {
		orderFulfillmentUpdateTracking(id: $id, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_INVOICE_CREATE_MUTATION = gql`
	mutation InvoiceCreate($orderId: ID!, $input: InvoiceCreateInput!) {
		invoiceCreate(orderId: $orderId, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const VARIANTS_FOR_ORDER_QUERY = gql`
	query products(
		$channel: String!
		$first: Int
		$after: String
		$last: Int
		$before: String
		$filter: ProductFilterInput
		$address: AddressInput
	) {
		products(
			first: $first
			after: $after
			last: $last
			before: $before
			channel: $channel
			filter: $filter
		) {
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
	}
`;

export const CREATE_DRAFT_ORDER_MUTATION = gql`
	mutation CreateDraftOrder($input: DraftOrderCreateInput!) {
		draftOrderCreate(input: $input) {
			errors {
				field
				message
			}
			order {
				id
			}
		}
	}
`;

export const ORDER_LINES_CREATE_MUTATION = gql`
	mutation CreateOrderLines($id: ID!, $input: [OrderLineCreateInput!]!) {
		orderLinesCreate(id: $id, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const DRAFT_ORDER_UPDATE_MUTATION = gql`
	mutation UpdateDraftOrder($id: ID!, $input: DraftOrderInput!) {
		draftOrderUpdate(id: $id, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const DRAFT_ORDER_LIST_QUERY = gql`
	query DraftOrders(
		$first: Int
		$after: String
		$last: Int
		$before: String
		$sortBy: OrderSortingInput
		$filter: OrderDraftFilterInput
	) {
		draftOrders(
			first: $first
			after: $after
			last: $last
			before: $before
			sortBy: $sortBy
			filter: $filter
		) {
			edges {
				node {
					id
					created
					number
					userEmail
					total {
						gross {
							amount
							currency
						}
					}
					user {
						email
						firstName
						lastName
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
	}
`;

export const ORDER_VOID_MUTATION = gql`
	mutation OrderVoid($id: ID!) {
		orderVoid(id: $id) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_CANCEL_MUTATION = gql`
	mutation OrderCancel($id: ID!) {
		orderCancel(id: $id) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_CAPTURE_MUTATION = gql`
	mutation OrderCapture($id: ID!, $amount: PositiveDecimal!) {
		orderCapture(id: $id, amount: $amount) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_UPDATE_NOTE_MUTATION = gql`
	mutation OrderUpdateNote($id: ID!, $input: OrderNoteInput!) {
		orderNoteUpdate(id: $id, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_SHIPPING_UPDATE_MUTATION = gql`
	mutation OrderShippingUpdate($order: ID!, $input: OrderUpdateShippingInput!) {
		orderUpdateShipping(order: $order, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_LINE_DELETE_MUTATION = gql`
	mutation OrderLineDelete($id: ID!) {
		orderLineDelete(id: $id) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_LINES_ADD_MUTATION = gql`
	mutation OrderLinesAdd($id: ID!, $input: [OrderLineCreateInput!]!) {
		orderLinesCreate(id: $id, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_LINE_UPDATE_MUTATION = gql`
	mutation OrderLineUpdate($id: ID!, $input: OrderLineInput!) {
		orderLineUpdate(id: $id, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_FULFILLMENT_APPROVE_MUTATION = gql`
	mutation OrderFulfillmentApprove(
		$id: ID!
		$notifyCustomer: Boolean!
		$allowStockToBeExceeded: Boolean
	) {
		orderFulfillmentApprove(
			id: $id
			notifyCustomer: $notifyCustomer
			allowStockToBeExceeded: $allowStockToBeExceeded
		) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_DRAFT_FINALIZE_MUTATION = gql`
	mutation OrderDraftFinalize($id: ID!) {
		draftOrderComplete(id: $id) {
			errors {
				field
				message
			}
		}
	}
`;

export const DRAFT_ORDER_DELETE_MUTATION = gql`
	mutation DraftOrderDelete($id: ID!) {
		draftOrderDelete(id: $id) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_MARK_AS_PAID_MUTATION = gql`
	mutation OrderMarkAsPaid($id: ID!, $transactionReference: String) {
		orderMarkAsPaid(id: $id, transactionReference: $transactionReference) {
			errors {
				field
				message
			}
		}
	}
`;

export const INVOICE_REQUEST_MUTATION = gql`
	mutation InvoiceRequest($orderId: ID!) {
		invoiceRequest(orderId: $orderId) {
			errors {
				field
				message
			}
		}
	}
`;

export const INVOICE_EMAIL_SEND_MUTATION = gql`
	mutation InvoiceEmailSend($id: ID!) {
		invoiceSendNotification(id: $id) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_TRANSACTION_REQUEST_ACTION_MUTATION = gql`
	mutation OrderTransactionRequestAction(
		$actionType: TransactionActionEnum!
		$id: ID!
		$amount: PositiveDecimal
	) {
		transactionRequestAction(actionType: $actionType, id: $id, amount: $amount) {
			errors {
				field
				message
			}
		}
	}
`;

export const TRANSACTION_CREATE_MUTATION = gql`
	mutation TransactionCreate(
		$id: ID!
		$transaction: TransactionCreateInput!
		$transactionEvent: TransactionEventInput!
	) {
		transactionCreate(id: $id, transaction: $transaction, transactionEvent: $transactionEvent) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_DISCOUNT_ADD_MUTATION = gql`
	mutation OrderDiscountAdd($orderId: ID!, $input: OrderDiscountCommonInput!) {
		orderDiscountAdd(orderId: $orderId, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_DISCOUNT_UPDATE_MUTATION = gql`
	mutation OrderDiscountUpdate($orderId: ID!, $input: OrderDiscountCommonInput!) {
		orderDiscountUpdate(orderId: $orderId, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_LINE_DISCOUNT_UPDATE_MUTATION = gql`
	mutation OrderLineDiscountUpdate($orderLineId: ID!, $input: OrderDiscountCommonInput!) {
		orderLineDiscountUpdate(orderLineId: $orderLineId, input: $input) {
			errors {
				field
				message
			}
		}
	}
`;

export const ORDER_LINE_DISCOUNT_REMOVE_MUTATION = gql`
	mutation OrderLineDiscountRemove($orderLineId: ID!) {
		orderLineDiscountRemove(orderLineId: $orderLineId) {
			errors {
				field
				message
			}
		}
	}
`;


export const ORDER_DISCOUNT_DELETE_MUTATION = gql`
	mutation OrderDiscountDelete($discountId: ID!) {
		orderDiscountDelete(discountId: $discountId) {
			errors {
				field
				message
			}
		}
	}
`;
