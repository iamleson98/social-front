import { OrderStatus, PaymentChargeStatusEnum } from "$lib/gql/graphql";


export const paymentStatusBadgeClass = (status: PaymentChargeStatusEnum) => {
	// NOTE: Those badge classes are found on: https://v5.daisyui.com/components/badge/
	switch (status) {
		case PaymentChargeStatusEnum.Cancelled:
			return 'badge-error';
		case PaymentChargeStatusEnum.FullyCharged:
			return 'badge-success';
		case PaymentChargeStatusEnum.FullyRefunded:
			return 'badge-primary';
		case PaymentChargeStatusEnum.NotCharged:
			return 'badge-warning';
		case PaymentChargeStatusEnum.PartiallyCharged:
			return 'badge-info';
		case PaymentChargeStatusEnum.PartiallyRefunded:
			return 'badge-accent';
		case PaymentChargeStatusEnum.Pending:
			return 'badge-dash! badge-neutral';
		case PaymentChargeStatusEnum.Refused:
			return 'badge-neutral';
		default:
			return 'badge-success';
	}
};

export const orderStatusBadgeClass = (status: OrderStatus) => {
	// NOTE: Those badge classes are found on: https://v5.daisyui.com/components/badge/

	switch (status) {
		case OrderStatus.Canceled:
			return 'badge-error';
		case OrderStatus.Draft:
			return 'badge-neutral';
		case OrderStatus.Expired:
			return 'badge-secondary';
		case OrderStatus.Fulfilled:
			return 'badge-success';
		case OrderStatus.PartiallyFulfilled:
			return 'badge-accent';
		case OrderStatus.PartiallyReturned:
			return 'badge-info';
		case OrderStatus.Returned:
			return 'badge-warning';
		case OrderStatus.Unconfirmed:
			return 'badge-dash! badge-neutral';
		case OrderStatus.Unfulfilled:
			return 'badge-neutral';
		default:
			return 'badge-success';
	}
};
