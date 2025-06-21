import { type GiftCardEvent, type Order, type Money, PaymentChargeStatusEnum, GiftCardEventsEnum, FulfillmentStatus } from '$lib/gql/graphql';
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

export const getAuthorizedAmount = (order: Order) => order?.total?.gross;
export const getShipmentCost = (order: Order) =>
  getAuthorizedAmount(order)?.currency &&
  (order?.shippingPrice?.gross || {
    amount: 0,
    currency: getAuthorizedAmount(order)?.currency,
  });

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
