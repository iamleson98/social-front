import { type GiftCardEvent, type Order, type Money, PaymentChargeStatusEnum, GiftCardEventsEnum, FulfillmentStatus, type OrderLine, type Fulfillment } from '$lib/gql/graphql';
import { subtractMoney } from '$lib/utils/utils';

export enum OrderRefundType {
  MISCELLANEOUS = 'miscellaneous',
  PRODUCTS = 'products',
}

export function extractOrderGiftCardUsedAmount(order?: Order): number | undefined {
  if (!order || !order.giftCards) return undefined;

  const usedInOrderEvents = order.giftCards
    .flatMap(giftCard => giftCard?.events)
    .filter((e: GiftCardEvent) => e.type === GiftCardEventsEnum.UsedInOrder && e.orderId === order.id);

  if (!usedInOrderEvents.length) return undefined;

  return usedInOrderEvents.reduce((sum, e) => {
    const diff = e.balance!.oldCurrentBalance!.amount - e.balance!.currentBalance!.amount;
    return sum + diff;
  }, 0);
};

export function extractOutstandingBalance(order: Order): Money {
  const total = order.total?.gross;
  if (!total || !order.totalCharged) return { amount: 0, currency: total?.currency ?? "VND" };

  return {
    amount: total.amount - order.totalCharged.amount,
    currency: total.currency
  };
};

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
        currency: total.currency
      };
  }
};

export const getAuthorizedAmount = (order: Order) => order?.total.gross;

export const getShipmentCost = (order: Order) => {
  if (order.shippingPrice.gross) {
    return order.shippingPrice.gross;
  }

  if (order.total.gross.currency) {
    return {
      amount: 0,
      currency: order.total.gross.currency
    };
  }

  return {
    amount: 0,
    currency: ""
  };
}

export function getDiscountAmount(amount: Money): Money {
  if (amount.amount <= 0) return amount;
  return {
    ...amount,
    amount: -amount.amount
  };
};

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

export const getRefundedLinesPriceSum = (orderLines: OrderLine[], refundedProductQuantities: RefundQuantityProps[]) => {
  return orderLines.reduce((sum, line) => {
    const refundedLine = refundedProductQuantities.find(
      refundedLine => refundedLine.id === line.id,
    );

    return sum + line.unitPrice.gross.amount * (refundedLine?.value || 0);
  }, 0);
};

export const getAllFulfillmentLinesPriceSum = (fulfillments: Fulfillment[], refundedProductQuantities: RefundQuantityProps[]) => {
  return fulfillments?.reduce((sum, fulfillment) => {
    const fulfilmentLinesSum = fulfillment?.lines?.reduce((sum, line) => {
      const refundedLine = refundedProductQuantities.find(
        refundedLine => refundedLine.id === line.id,
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
};

export const getRefundProductsAmountValues = (order: Order, unfulfilledItemsQuantities: RefundQuantityProps[], fulfilledItemsQuantities: RefundQuantityProps[], waitingItemsQuantities: RefundQuantityProps[], refundShipmentCosts: boolean) => {
  const authorizedAmount = getAuthorizedAmount(order);
  const shipmentCost = getShipmentCost(order);
  const previouslyRefunded = getPreviouslyRefundedPrice(order);
  const maxRefund = getOrderCharged(order);

  const refundedLinesSum = getRefundedLinesPriceSum(
    order?.lines,
    unfulfilledItemsQuantities,
  );

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

export const getMiscellaneousAmountValues = (
  order: Order,
): PaymentSubmitCardValuesProps => {
  const authorizedAmount = order?.total?.gross;
  const previouslyRefunded = getPreviouslyRefundedPrice(order);
  const maxRefund = getOrderCharged(order);

  return {
    authorizedAmount,
    maxRefund,
    previouslyRefunded,
  };
};
