import { type GiftCardEvent, type GiftCard, type Order, type Money, PaymentChargeStatusEnum } from '$lib/gql/graphql';

export function obtainUsedGiftcards(order?: Order): GiftCard[] | null {
  if (!order) return null;
  const giftCards = order.giftCards || [];
  return giftCards.length > 0 ? giftCards : null;
}

export function extractOrderGiftCardUsedAmount(order?: Order): number | undefined {
  if (!order || !order.giftCards || !Array.isArray(order.giftCards)) return undefined;

  const orderId = order.id;
  const usedInOrderEvents = order.giftCards
    .flatMap(giftCard => giftCard?.events || [])
    .filter((e): e is GiftCardEvent => e?.type === 'USED_IN_ORDER' && e.orderId === orderId);

  if (!usedInOrderEvents.length) return undefined;

  return usedInOrderEvents.reduce((sum, e) => {
    const balance = e.balance!;
    const diff = balance.oldCurrentBalance!.amount - balance.currentBalance!.amount;
    return sum + diff;
  }, 0);
}

export function extractOutstandingBalance(order: Order): Money {
  const total = order.total?.gross;
  const captured = order.totalCaptured;
  if (!total || !captured) return { amount: 0, currency: total?.currency ?? 'USD' };

  return {
    amount: total.amount - captured.amount,
    currency: total.currency
  };
}

export function extractRefundedAmount(order: Order): Money {
  const total = order.total?.gross;

  if (!total) return { amount: 0, currency: 'USD' };

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
