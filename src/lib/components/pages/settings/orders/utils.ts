import type { TranFunc } from '$i18n';
import {
	type GiftCardEvent,
	type Order,
	type Money,
	PaymentChargeStatusEnum,
	GiftCardEventsEnum,
	FulfillmentStatus,
	type OrderLine,
	type Fulfillment,
	MarkAsPaidStrategyEnum,
	type OrderDiscount,
	OrderDiscountType,
	type Transaction,
	type TransactionItem,
	TransactionActionEnum,
	type OrderGrantedRefund,
	OrderGrantedRefundStatusEnum,
	type TransactionEvent,
	TransactionEventTypeEnum,
	type UserOrApp,
	type Payment,
	TransactionKind,
	type PaymentGateway,
	OrderAction,
	type User,
	type GiftCard,
} from '$lib/gql/graphql';
import { subtractMoney } from '$lib/utils/utils';

export enum OrderRefundType {
	MISCELLANEOUS = 'miscellaneous',
	PRODUCTS = 'products',
}

export function extractOrderGiftCardUsedAmount(order?: Order): number | undefined {
	if (!order || !order.giftCards) return undefined;

	const usedInOrderEvents = order.giftCards
		.flatMap((giftCard) => giftCard?.events)
		.filter(
			(e: GiftCardEvent) => e.type === GiftCardEventsEnum.UsedInOrder && e.orderId === order.id,
		);

	if (!usedInOrderEvents.length) return undefined;

	return usedInOrderEvents.reduce((sum, e) => {
		const diff = e.balance!.oldCurrentBalance!.amount - e.balance!.currentBalance!.amount;
		return sum + diff;
	}, 0);
}

export function extractOutstandingBalance(order: Order): Money {
	const total = order.total?.gross;
	if (!total || !order.totalCharged) return { amount: 0, currency: total?.currency ?? 'VND' };

	return {
		amount: total.amount - order.totalCharged.amount,
		currency: total.currency,
	};
}

export function extractRefundedAmount(order: Order): Money {
	const total = order.total?.gross;

	if (!total) return { amount: 0, currency: 'VND' };

	switch (order.paymentStatus) {
		case PaymentChargeStatusEnum.FullyRefunded:
			return total;
		case PaymentChargeStatusEnum.PartiallyRefunded:
			return extractOutstandingBalance(order);
		default:
			return {
				amount: 0,
				currency: total.currency,
			};
	}
}

export const getAuthorizedAmount = (order: Order) => order?.total.gross;

export const getShipmentCost = (order: Order) => {
	if (order.shippingPrice.gross) {
		return order.shippingPrice.gross;
	}

	if (order.total.gross.currency) {
		return {
			amount: 0,
			currency: order.total.gross.currency,
		};
	}

	return {
		amount: 0,
		currency: '',
	};
};

export function getDiscountAmount(amount: Money): Money {
	if (amount.amount <= 0) return amount;
	return {
		...amount,
		amount: -amount.amount,
	};
}

export function getOrderCharged(order: Order) {
	if (order?.totalCharged) {
		return order.totalCharged;
	}

	return order?.totalCharged;
}

export function getPreviouslyRefundedPrice(order: Order): Money {
	return (
		getOrderCharged(order) &&
		order?.total?.gross &&
		subtractMoney(getOrderCharged(order), order?.total?.gross)
	);
}

export const getRefundedLinesPriceSum = (
	orderLines: OrderLine[],
	refundedProductQuantities: RefundQuantityProps[],
) => {
	return orderLines.reduce((sum, line) => {
		const refundedLine = refundedProductQuantities.find(
			(refundedLine) => refundedLine.id === line.id,
		);

		return sum + line.unitPrice.gross.amount * (refundedLine?.value || 0);
	}, 0);
};

export const getAllFulfillmentLinesPriceSum = (
	fulfillments: Fulfillment[],
	refundedProductQuantities: RefundQuantityProps[],
) => {
	return fulfillments?.reduce((sum, fulfillment) => {
		const fulfilmentLinesSum = fulfillment?.lines?.reduce((sum, line) => {
			const refundedLine = refundedProductQuantities.find(
				(refundedLine) => refundedLine.id === line.id,
			);

			return sum + (line?.orderLine?.unitPrice?.gross?.amount || 0) * (refundedLine?.value || 0);
		}, 0);

		return sum + (fulfilmentLinesSum || 0);
	}, 0);
};

export const getCalculatedTotalAmount = ({
	shipmentCost,
	shipmentCosts,
	allLinesSum,
	maxRefund,
}: {
	shipmentCost?: Money;
	shipmentCosts: boolean;
	allLinesSum: number;
	maxRefund?: Money;
	previouslyRefunded?: Money;
}) => {
	if (maxRefund?.amount === 0) {
		return 0;
	}

	const shipmentCostValue = shipmentCost ? shipmentCost.amount : 0;
	const calculatedTotalAmount = shipmentCosts ? allLinesSum + shipmentCostValue : allLinesSum;

	return calculatedTotalAmount;
};

export const refundFulfilledStatuses = [
	FulfillmentStatus.Fulfilled,
	FulfillmentStatus.Returned,
	FulfillmentStatus.WaitingForApproval,
];

export type RefundQuantityProps = {
	data: null;
	id: string;
	label: null;
	value: number;
};

export interface PaymentSubmitCardValuesProps {
	authorizedAmount: Money;
	shipmentCost?: Money;
	selectedProductsValue?: Money;
	previouslyRefunded: Money;
	maxRefund: Money;
	proposedRefundAmount?: Money;
	replacedProductsValue?: Money;
	refundTotalAmount?: Money;
}

export const getRefundProductsAmountValues = (
	order: Order,
	unfulfilledItemsQuantities: RefundQuantityProps[],
	fulfilledItemsQuantities: RefundQuantityProps[],
	waitingItemsQuantities: RefundQuantityProps[],
	refundShipmentCosts: boolean,
) => {
	const authorizedAmount = getAuthorizedAmount(order);
	const shipmentCost = getShipmentCost(order);
	const previouslyRefunded = getPreviouslyRefundedPrice(order);
	const maxRefund = getOrderCharged(order);

	const refundedLinesSum = getRefundedLinesPriceSum(order?.lines, unfulfilledItemsQuantities);

	const waitingLinesSum = getAllFulfillmentLinesPriceSum(
		order?.fulfillments,
		waitingItemsQuantities,
	);

	const allFulfillmentLinesSum = getAllFulfillmentLinesPriceSum(
		order?.fulfillments,
		fulfilledItemsQuantities,
	);

	const allLinesSum = refundedLinesSum + allFulfillmentLinesSum + waitingLinesSum;

	const calculatedTotalAmount = getCalculatedTotalAmount({
		allLinesSum,
		maxRefund,
		previouslyRefunded,
		shipmentCost,
		shipmentCosts: refundShipmentCosts,
	});

	const selectedProductsValue: Money = {
		amount: allLinesSum,
		currency: authorizedAmount.currency,
	};

	const proposedRefundAmount: Money = {
		amount: calculatedTotalAmount,
		currency: authorizedAmount.currency,
	};

	const refundTotalAmount: Money = {
		amount: calculatedTotalAmount,
		currency: authorizedAmount.currency,
	};

	return {
		authorizedAmount,
		shipmentCost,
		selectedProductsValue,
		previouslyRefunded,
		maxRefund,
		proposedRefundAmount,
		refundTotalAmount,
	};
};

export const getMiscellaneousAmountValues = (order: Order): PaymentSubmitCardValuesProps => {
	const authorizedAmount = order?.total?.gross;
	const previouslyRefunded = getPreviouslyRefundedPrice(order);
	const maxRefund = getOrderCharged(order);

	return {
		authorizedAmount,
		maxRefund,
		previouslyRefunded,
	};
};

export const orderHasTransactions = (order: Order) => order.transactions.length > 0;
const orderHasPayments = (order: Order) => order.payments.length > 0;

export const orderShouldUseTransactions = (order: Order) => {
	if (orderHasTransactions(order)) return true;
	if (orderHasPayments(order)) return false;
	return order.channel.orderSettings.markAsPaidStrategy === MarkAsPaidStrategyEnum.TransactionFlow;
};

export const getDeliveryMethodName = (order: Order, tranFunc: TranFunc) => {
	if (order.shippingMethodName === undefined && order.shippingPrice === undefined && order.collectionPointName === undefined) return undefined;

	if (order.shippingMethodName === null)
		return order.collectionPointName == null ? 'doe not apply' : 'click and collect';

	return order.shippingMethodName;
};

export const getTaxTypeText = (order: Order, tranFunc: TranFunc) => {
	if (order.total.tax === undefined) return '';

	if (order.total.tax.amount > 0) return 'vat included';
	return 'vat not included';
};

const NAME_SEPARATOR = ":";

const getDiscountNameLabel = (name: string) => {
	if (name.includes(NAME_SEPARATOR)) {
		const [promotionName] = name.split(NAME_SEPARATOR);

		return promotionName.trim() || "-";
	}

	return name;
};

export const getDiscountTypeLabel = (discount: OrderDiscount, tranFunc: TranFunc) => {
	switch (discount.type) {
		case OrderDiscountType.Manual:
			return "staff added"
		case OrderDiscountType.OrderPromotion:
			return getDiscountNameLabel(discount.name ?? "");
		case OrderDiscountType.Voucher:
			return "voucher: " + discount.name;

		case OrderDiscountType.Promotion:
			return 'promotion';

		case OrderDiscountType.Sale:
			return 'sale';
	}
};

export const getShouldDisplayAmounts = (order: Order) => {
	if (!order) {
		return {
			authorized: false,
			charged: false,
			cancelled: false,
			authorizedPending: false,
			chargedPending: false,
			cancelledPending: false,
		};
	}

	const authorized = order.totalAuthorized?.amount ?? 0;
	const authorizePending = order.totalAuthorizePending?.amount ?? 0;
	const charged = order.totalCharged?.amount ?? 0;
	const chargePending = order.totalChargePending?.amount ?? 0;
	const cancelled = order.totalCanceled?.amount ?? 0;
	const cancelPending = order.totalCancelPending?.amount ?? 0;
	const total = order.total.gross?.amount ?? 0;
	const anyPending = authorizePending > 0 || chargePending > 0 || cancelPending > 0;

	if (anyPending) {
		return {
			authorized: !!authorized || !!authorizePending,
			charged: true,
			cancelled: true,
			authorizedPending: authorizePending > 0,
			chargedPending: chargePending > 0,
			cancelledPending: cancelPending > 0,
		};
	}

	if (authorized && charged) {
		return {
			authorized: true,
			charged: true,
			cancelled: !!cancelled,
			authorizedPending: false,
			chargedPending: false,
			cancelledPending: false,
		};
	}

	if (charged !== 0 && charged !== total) {
		return {
			authorized: false,
			charged: true,
			cancelled: !!cancelled,
			authorizedPending: false,
			chargedPending: false,
			cancelledPending: false,
		};
	}

	if (authorized !== 0) {
		return {
			authorized: true,
			charged: false,
			cancelled: !!cancelled,
			authorizedPending: false,
			chargedPending: false,
			cancelledPending: false,
		};
	}

	if (cancelled) {
		return {
			authorized: false,
			charged: false,
			cancelled: true,
			authorizedPending: false,
			chargedPending: false,
			cancelledPending: false,
		};
	}

	return {
		charged: false,
		authorized: false,
		cancelled: false,
		authorizedPending: false,
		chargedPending: false,
		cancelledPending: false,
	};
};

export type OrderRefundDisplay = OrderGrantedRefund & {
	type: "standard" | "manual";
	reasonNote?: string | null;
	reasonType: string | null;
};

export type OrderRefundState =
	| "noTransactionsToRefund"
	| "allTransactionsNonRefundable"
	| "refundable";

export const getRefundState = (transactions: TransactionItem[]): OrderRefundState => {
	if (!transactions.length) return "noTransactionsToRefund";

	if (transactions.every((transaction) => transaction.actions.includes(TransactionActionEnum.Refund)))
		return "allTransactionsNonRefundable";

	return "refundable";
};

const convertGrantedRefundsToOrderRefunds = (grantedRefunds: OrderGrantedRefund[]) => {
	return grantedRefunds.map<OrderRefundDisplay>(refund => ({
		...refund,
		type: "standard",
		reasonType: refund.reasonReference?.title ?? null,
		reasonNote: refund.reason,
	}));
};

const groupEventsByPspReference = (events: TransactionEvent[]) => {
	return events?.reduce<Record<string, TransactionEvent[]>>((acc, event) => {
		if (!acc[event.pspReference]) {
			acc[event.pspReference] = [];
		}

		acc[event.pspReference].push(event);

		return acc;
	}, {});
}

const findLatestEventWithUserAuthor = (
	eventGroup: TransactionEvent[],
): TransactionEvent | null => {
	return eventGroup.find(event => event.createdBy?.__typename === "User") || null;
};

const mapEventToRefundStatus = (
	event: TransactionEvent,
): OrderGrantedRefundStatusEnum => {
	switch (event.type) {
		case TransactionEventTypeEnum.RefundSuccess:
			return OrderGrantedRefundStatusEnum.Success;
		case TransactionEventTypeEnum.RefundFailure:
			return OrderGrantedRefundStatusEnum.Failure;
		case TransactionEventTypeEnum.RefundRequest:
			return OrderGrantedRefundStatusEnum.Pending;
		default:
			return OrderGrantedRefundStatusEnum.None;
	}
};

const determineCreatorDisplay = (
	creator?: UserOrApp | null,
): User | null => {
	if (creator?.__typename === "User") {
		return creator;
	}

	return null;
};

const mapEventGroupsToOrderManualRefunds = (
	eventsByPspReference: Record<string, TransactionEvent[]>,
): OrderRefundDisplay[] => {
	return Object.values(eventsByPspReference).map(eventGroup => {
		const sortedEvents = eventGroup.sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
		const latestEvent = sortedEvents[0];
		const latestEventWithAuthor =
			findLatestEventWithUserAuthor(sortedEvents);

		const resultModel: OrderRefundDisplay = {
			id: latestEvent.id,
			type: "manual" as const,
			status: mapEventToRefundStatus(latestEvent),
			amount: latestEvent.amount,
			createdAt: latestEvent.createdAt,
			user: determineCreatorDisplay(
				latestEventWithAuthor?.createdBy,
			),
			reasonNote: null,
			reasonType: null,
			shippingCostsIncluded: false,
			updatedAt: latestEvent.createdAt,
		};

		// Only REQUEST contains a reason, that is attached when transactionRequestAction("refund") is executed
		const eventRequestType = sortedEvents.find(e => e.type === TransactionEventTypeEnum.RefundRequest);

		if (eventRequestType) {
			resultModel.reasonNote = eventRequestType.message ?? null;
			resultModel.reasonType = eventRequestType.reasonReference?.title ?? null;
		}

		return resultModel;
	});
}

const convertManualRefundsToOrderRefunds = (
	transactionsEvents: TransactionEvent[],
	grantedRefunds: OrderGrantedRefund[],
): OrderRefundDisplay[] => {
	const supportedRefunds = new Set([
		TransactionEventTypeEnum.RefundSuccess,
		TransactionEventTypeEnum.RefundFailure,
		TransactionEventTypeEnum.RefundRequest,
	]);
	const refundEvents = transactionsEvents.filter(
		event => event.type && supportedRefunds.has(event.type),
	);

	const idsOfEventsAssociatedToGrantedRefunds = new Set(
		grantedRefunds.flatMap(refund => refund.transactionEvents?.map(te => te.id)),
	);

	const manualRefundEvents =
		refundEvents?.filter(event => !idsOfEventsAssociatedToGrantedRefunds.has(event.id)) ?? [];

	const eventsByPspReference =
		groupEventsByPspReference(manualRefundEvents);

	return mapEventGroupsToOrderManualRefunds(eventsByPspReference);
}

export const prepareOrderRefundDisplayList = (transactionsEvents: TransactionEvent[], grantedRefunds: OrderGrantedRefund[]) => {
	return [
		...convertGrantedRefundsToOrderRefunds(grantedRefunds),
		...convertManualRefundsToOrderRefunds(transactionsEvents, grantedRefunds),
	].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export function canEditRefund(refund: OrderRefundDisplay): boolean {
	const isSuccessful = refund.status === OrderGrantedRefundStatusEnum.Success;
	const isPending = refund.status === OrderGrantedRefundStatusEnum.Pending;
	const isManual = refund.type === "manual";

	// Can only edit refunds that are not successful, not pending, and not manual
	return !isSuccessful && !isPending && !isManual;
}

export type FakeTransaction = Omit<TransactionItem, "events" | "__typename"> & {
	__typename: "FakeTransaction";
};

export type OrderTransaction = TransactionItem | FakeTransaction;

export type ExtendedOrderTransaction = OrderTransaction & {
	index?: number;
};

export type TransactionFakeEvent = Omit<Partial<TransactionEvent>, "type" | "__typename"> & {
	__typename: "TransactionFakeEvent";
	mappedResult: TransactionMappingResult;
};

/** Type of the trasaction event (e.g. CHARGE_SUCCESS -> CHARGE) */
export type TransactionEventType =
	| "REFUND"
	| "CHARGE"
	| "AUTHORIZATION"
	| "CANCEL"
	| "CHARGEBACK"
	| "AUTHORIZATION_ADJUSTMENT"
	| "REFUND_REVERSED"
	| "INFO"
	| null;

/** Status of the transaction (e.g. CHARGE_SUCCESS -> SUCCESS) */
export type TransactionEventStatus = "SUCCESS" | "FAILED" | "PENDING" | "REQUEST" | "INFO" | null;

export interface TransactionMappingResult {
	type: TransactionEventType;
	status: TransactionEventStatus;
}

const typeMap: Record<TransactionEventTypeEnum, TransactionMappingResult> = {
	INFO: {
		type: "INFO",
		status: "INFO",
	},
	CHARGE_BACK: {
		type: "CHARGEBACK",
		status: "INFO",
	},
	REFUND_REVERSE: {
		type: "REFUND_REVERSED",
		status: "INFO",
	},
	AUTHORIZATION_ADJUSTMENT: {
		type: "AUTHORIZATION_ADJUSTMENT",
		status: "INFO",
	},

	// Authorization
	AUTHORIZATION_FAILURE: {
		type: "AUTHORIZATION",
		status: "FAILED",
	},
	AUTHORIZATION_ACTION_REQUIRED: {
		type: "AUTHORIZATION",
		status: "INFO",
	},
	AUTHORIZATION_REQUEST: {
		type: "AUTHORIZATION",
		status: "REQUEST",
	},
	AUTHORIZATION_SUCCESS: {
		type: "AUTHORIZATION",
		status: "SUCCESS",
	},

	// Charge
	CHARGE_FAILURE: {
		type: "CHARGE",
		status: "FAILED",
	},
	CHARGE_ACTION_REQUIRED: {
		type: "CHARGE",
		status: "INFO",
	},
	CHARGE_REQUEST: {
		type: "CHARGE",
		status: "REQUEST",
	},
	CHARGE_SUCCESS: {
		type: "CHARGE",
		status: "SUCCESS",
	},

	// Cancel (previously void)
	CANCEL_FAILURE: {
		type: "CANCEL",
		status: "FAILED",
	},
	CANCEL_REQUEST: {
		type: "CANCEL",
		status: "REQUEST",
	},
	CANCEL_SUCCESS: {
		type: "CANCEL",
		status: "SUCCESS",
	},

	// Refunds
	REFUND_FAILURE: {
		type: "REFUND",
		status: "FAILED",
	},
	REFUND_REQUEST: {
		type: "REFUND",
		status: "REQUEST",
	},
	REFUND_SUCCESS: {
		type: "REFUND",
		status: "SUCCESS",
	},
};

const mapPaymentKindToTransaction = (
	kind: TransactionKind,
	isSuccess: boolean,
): TransactionMappingResult => {
	const status: TransactionEventStatus = isSuccess ? "SUCCESS" : "FAILED";

	switch (kind) {
		case TransactionKind.Refund:
			return {
				type: "REFUND",
				status,
			};
		case TransactionKind.RefundOngoing:
			return {
				type: "REFUND",
				status: "PENDING",
			};
		case TransactionKind.Cancel:
			return {
				type: "CANCEL",
				status,
			};
		case TransactionKind.Void:
			return {
				type: "CANCEL",
				status,
			};
		case TransactionKind.Auth:
			return {
				type: "AUTHORIZATION",
				status,
			};
		case TransactionKind.Capture:
			return {
				type: "CHARGE",
				status,
			};
		case TransactionKind.Pending:
			return {
				type: "CHARGE",
				status: "PENDING",
			};
		default:
			return {
				type: null,
				status: null,
			};
	}
};

export const getTransactionAmount = (money: Money | null | undefined, fallbackCurrency: string): Money => {
	if (!money) {
		return {
			currency: fallbackCurrency,
			amount: 0,
			__typename: "Money",
		};
	}

	return money;
};

export const prepareMoney = (
	amount: number,
	currency: string,
): Money => ({
	__typename: "Money",
	amount,
	currency: currency ?? "VND",
});

export const mapOrderActionsToTransactionActions = (
	orderActions: OrderAction[],
): TransactionActionEnum[] =>
	orderActions
		.map(action => {
			switch (action) {
				case OrderAction.Void:
					return TransactionActionEnum.Cancel;
				case OrderAction.Capture:
					return TransactionActionEnum.Charge;
				case OrderAction.Refund:
					return TransactionActionEnum.Refund;
				default:
					return null;
			}
		})
		.filter(mappedAction => mappedAction !== null);

export const findMethodName = (gatewayId: string, allMethods: PaymentGateway[]): string =>
	allMethods.find(method => method.id === gatewayId)?.name ?? gatewayId;

export const mapPaymentToTransactionEvents = (
	payment: Payment,
): TransactionFakeEvent[] => {
	const transactions = payment.transactions ?? [];

	if (transactions.length === 0) {
		return [
			{
				id: "",
				pspReference: "",
				mappedResult: {
					type: "AUTHORIZATION",
					status: "REQUEST",
				},
				createdBy: null,
				externalUrl: "",
				message: "",
				reasonReference: undefined,
				createdAt: payment.modified ?? new Date(),
				amount: undefined,
				__typename: "TransactionFakeEvent" as const,
			},
		];
	}

	return transactions
		.map(({ id, isSuccess, kind, created, token }) => {
			const mappedResult = mapPaymentKindToTransaction(kind, isSuccess);

			return {
				id,
				pspReference: token,
				message: kind,
				mappedResult,
				createdBy: null,
				reasonReference: undefined,
				externalUrl: undefined,
				createdAt: created,
				amount: undefined,
				__typename: "TransactionFakeEvent" as const,
			};
		})
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const mapTransactionEvent = (event: TransactionFakeEvent | TransactionEvent): TransactionMappingResult => {
	if (!event) return {
		type: null,
		status: null,
	};

	if (event.__typename === 'TransactionFakeEvent') return event.mappedResult;

	if (event.type && typeMap[event.type]) return typeMap[event.type];

	return {
		type: null,
		status: "INFO",
	};
}

const eventsWithoutAmount = [
	TransactionEventTypeEnum.CancelSuccess,
	TransactionEventTypeEnum.CancelRequest,
	TransactionEventTypeEnum.CancelFailure,
];

export const shouldShowAmount = (event: TransactionEvent | TransactionFakeEvent) => {
	if (!event || !event.amount?.currency)
		return false;

	if (
		event.__typename === "TransactionEvent" &&
		event.type &&
		eventsWithoutAmount.includes(event.type)
	) {
		return false;
	}

	return true;
};

export const getUsedInGiftCardEvents = (giftCard: GiftCard, orderId: string) => {
	if (!giftCard.events || !orderId) {
		return [];
	}

	return giftCard.events.filter(
		({ orderId: eventOrderId, type }) =>
			type === GiftCardEventsEnum.UsedInOrder && eventOrderId === orderId,
	);
};

export const getGiftCardAmount = (usedInOrderEvents: GiftCard["events"]) =>
	usedInOrderEvents.reduce((resultAmount, { balance }) => {
		if (!balance) return resultAmount;

		const { currentBalance, oldCurrentBalance } = balance;
		if (!oldCurrentBalance || !currentBalance) return resultAmount;

		const amountToAdd = oldCurrentBalance.amount - currentBalance.amount;

		return resultAmount + amountToAdd;
	}, 0);
