import { type GiftCardEvent, type Order, type Money, PaymentChargeStatusEnum, GiftCardEventsEnum } from '$lib/gql/graphql';

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
}

export function extractOutstandingBalance(order: Order): Money {
  const total = order.total?.gross;
  if (!total || !order.totalCharged) return { amount: 0, currency: total?.currency ?? "VND" };

  return {
    amount: total.amount - order.totalCharged.amount,
    currency: total.currency
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
        currency: total.currency
      };
  }
}

export function getDiscountAmount(amount: Money): Money {
  if (amount.amount <= 0) return amount;
  return {
    ...amount,
    amount: -amount.amount
  };
}
