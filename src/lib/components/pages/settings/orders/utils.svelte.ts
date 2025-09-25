import {
	DRAFT_ORDER_DELETE_MUTATION,
	DRAFT_ORDER_UPDATE_MUTATION,
	INVOICE_EMAIL_SEND_MUTATION,
	INVOICE_REQUEST_MUTATION,
	ORDER_ADD_NOTE_MUTATION,
	ORDER_CANCEL_FULFILLMENT_MUTATION,
	ORDER_CANCEL_MUTATION,
	ORDER_CAPTURE_MUTATION,
	ORDER_DISCOUNT_ADD_MUTATION,
	ORDER_DRAFT_FINALIZE_MUTATION,
	ORDER_FULFILLMENT_APPROVE_MUTATION,
	ORDER_FULFILLMENT_UPDATE_TRACKING_MUTATION,
	ORDER_LINE_DELETE_MUTATION,
	ORDER_LINE_UPDATE_MUTATION,
	ORDER_LINES_ADD_MUTATION,
	ORDER_MARK_AS_PAID_MUTATION,
	ORDER_SHIPPING_UPDATE_MUTATION,
	ORDER_TRANSACTION_REQUEST_ACTION_MUTATION,
	ORDER_UPDATE_NOTE_MUTATION,
	ORDER_VOID_MUTATION,
	TRANSACTION_CREATE_MUTATION,
} from '$lib/api/admin/orders';
import { GRAPHQL_CLIENT } from '$lib/api/client';
import type {
	DraftOrderInput,
	FulfillmentCancelInput,
	FulfillmentUpdateTrackingInput,
	Mutation,
	MutationDraftOrderCompleteArgs,
	MutationDraftOrderDeleteArgs,
	MutationDraftOrderUpdateArgs,
	MutationInvoiceRequestArgs,
	MutationInvoiceSendNotificationArgs,
	MutationOrderAddNoteArgs,
	MutationOrderCancelArgs,
	MutationOrderCaptureArgs,
	MutationOrderDiscountAddArgs,
	MutationOrderFulfillmentApproveArgs,
	MutationOrderFulfillmentCancelArgs,
	MutationOrderFulfillmentUpdateTrackingArgs,
	MutationOrderLineDeleteArgs,
	MutationOrderLinesCreateArgs,
	MutationOrderLineUpdateArgs,
	MutationOrderMarkAsPaidArgs,
	MutationOrderNoteUpdateArgs,
	MutationOrderUpdateShippingArgs,
	MutationOrderVoidArgs,
	MutationTransactionCreateArgs,
	MutationTransactionRequestActionArgs,
	OrderAddNoteInput,
	OrderDiscountCommonInput,
	OrderLineCreateInput,
	OrderLineInput,
	OrderNoteInput,
	OrderUpdateShippingInput,
	TransactionActionEnum,
	TransactionCreateInput,
	TransactionEventInput,
} from '$lib/gql/graphql';
import { CommonState } from '$lib/utils/common.svelte';
import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
import { get } from 'svelte/store';
import { writable } from 'svelte/store';

export class OrderUtils {
	loading = false;

	orderVoid = async (id: string) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderVoid'>,
			MutationOrderVoidArgs
		>(ORDER_VOID_MUTATION, {
			id,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'orderVoid', get(CommonState).EditSuccess);
	};

	orderCancel = async (id: string) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderCancel'>,
			MutationOrderCancelArgs
		>(ORDER_CANCEL_MUTATION, {
			id,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'orderCancel', get(CommonState).EditSuccess);
	};

	paymentCapture = async (id: string, amount: number) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderCapture'>,
			MutationOrderCaptureArgs
		>(ORDER_CAPTURE_MUTATION, {
			id,
			amount,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'orderCapture', get(CommonState).EditSuccess);
	};

	orderAddNote = async (id: string, input: OrderAddNoteInput) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderAddNote'>,
			MutationOrderAddNoteArgs
		>(ORDER_ADD_NOTE_MUTATION, {
			order: id,
			input,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'orderAddNote', get(CommonState).EditSuccess);
	};

	orderUpdateNote = async (id: string, input: OrderNoteInput) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderNoteUpdate'>,
			MutationOrderNoteUpdateArgs
		>(ORDER_UPDATE_NOTE_MUTATION, {
			note: id,
			input,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'orderNoteUpdate', get(CommonState).EditSuccess);
	};

	draftOrderUpdate = async (id: string, input: DraftOrderInput) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'draftOrderUpdate'>,
			MutationDraftOrderUpdateArgs
		>(DRAFT_ORDER_UPDATE_MUTATION, {
			id,
			input,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'draftOrderUpdate', get(CommonState).EditSuccess);
	};

	updateShippingMethod = async (order: string, input: OrderUpdateShippingInput) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderUpdateShipping'>,
			MutationOrderUpdateShippingArgs
		>(ORDER_SHIPPING_UPDATE_MUTATION, {
			order,
			input,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(
			result,
			'orderUpdateShipping',
			get(CommonState).EditSuccess,
		);
	};

	deleteOrderLine = async (id: string) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderLineDelete'>,
			MutationOrderLineDeleteArgs
		>(ORDER_LINE_DELETE_MUTATION, {
			id,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'orderLineDelete', get(CommonState).EditSuccess);
	};

	addOrderLines = async (id: string, input: OrderLineCreateInput[]) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderLinesCreate'>,
			MutationOrderLinesCreateArgs
		>(ORDER_LINES_ADD_MUTATION, {
			id,
			input,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'orderLinesCreate', get(CommonState).EditSuccess);
	};

	updateOrderLine = async (id: string, input: OrderLineInput) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderLineUpdate'>,
			MutationOrderLineUpdateArgs
		>(ORDER_LINE_UPDATE_MUTATION, {
			id,
			input,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'orderLineUpdate', get(CommonState).EditSuccess);
	};

	approveFulfillment = async (
		id: string,
		notifyCustomer: boolean,
		allowStockToBeExceeded?: boolean,
	) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderFulfillmentApprove'>,
			MutationOrderFulfillmentApproveArgs
		>(ORDER_FULFILLMENT_APPROVE_MUTATION, {
			id,
			notifyCustomer,
			allowStockToBeExceeded,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(
			result,
			'orderFulfillmentApprove',
			get(CommonState).EditSuccess,
		);
	};

	cancelFulfillment = async (id: string, input?: FulfillmentCancelInput) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderFulfillmentCancel'>,
			MutationOrderFulfillmentCancelArgs
		>(ORDER_CANCEL_FULFILLMENT_MUTATION, {
			id,
			input,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(
			result,
			'orderFulfillmentCancel',
			get(CommonState).EditSuccess,
		);
	};

	orderFulfillmentUpdateTracking = async (id: string, input: FulfillmentUpdateTrackingInput) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderFulfillmentUpdateTracking'>,
			MutationOrderFulfillmentUpdateTrackingArgs
		>(ORDER_FULFILLMENT_UPDATE_TRACKING_MUTATION, {
			id,
			input,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(
			result,
			'orderFulfillmentUpdateTracking',
			get(CommonState).EditSuccess,
		);
	};

	finalizeDraftOrder = async (id: string) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'draftOrderComplete'>,
			MutationDraftOrderCompleteArgs
		>(ORDER_DRAFT_FINALIZE_MUTATION, {
			id,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'draftOrderComplete', get(CommonState).EditSuccess);
	};

	deleteDraftOrder = async (id: string, externalReference?: string) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'draftOrderDelete'>,
			MutationDraftOrderDeleteArgs
		>(DRAFT_ORDER_DELETE_MUTATION, {
			id,
			externalReference,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'draftOrderDelete', get(CommonState).DeleteSuccess);
	};

	markAsPaid = async (id: string, transactionReference?: string) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderMarkAsPaid'>,
			MutationOrderMarkAsPaidArgs
		>(ORDER_MARK_AS_PAID_MUTATION, {
			id,
			transactionReference,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'orderMarkAsPaid', get(CommonState).EditSuccess);
	};

	invoiceRequest = async (id: string, number?: string) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'invoiceRequest'>,
			MutationInvoiceRequestArgs
		>(INVOICE_REQUEST_MUTATION, {
			orderId: id,
			number,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'invoiceRequest', get(CommonState).EditSuccess);
	};

	invoiceSendNotification = async (id: string) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'invoiceSendNotification'>,
			MutationInvoiceSendNotificationArgs
		>(INVOICE_EMAIL_SEND_MUTATION, {
			id,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(
			result,
			'invoiceSendNotification',
			get(CommonState).EditSuccess,
		);
	};

	transactionActionSend = async (
		actionType: TransactionActionEnum,
		amount?: number,
		id?: string,
		token?: string,
	) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'transactionRequestAction'>,
			MutationTransactionRequestActionArgs
		>(ORDER_TRANSACTION_REQUEST_ACTION_MUTATION, {
			id,
			actionType,
			amount,
			token,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(
			result,
			'transactionRequestAction',
			get(CommonState).EditSuccess,
		);
	};

	transactionCreate = async (
		id: string,
		transaction: TransactionCreateInput,
		transactionEvent: TransactionEventInput,
	) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'transactionCreate'>,
			MutationTransactionCreateArgs
		>(TRANSACTION_CREATE_MUTATION, {
			id,
			transaction,
			transactionEvent,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'transactionCreate', get(CommonState).EditSuccess);
	};

	orderAddDiscount = async (orderId: string, input: OrderDiscountCommonInput) => {
		this.loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderDiscountAdd'>,
			MutationOrderDiscountAddArgs
		>(ORDER_DISCOUNT_ADD_MUTATION, {
			orderId,
			input,
		});
		this.loading = false;
		return checkIfGraphqlResultHasError(result, 'orderDiscountAdd', get(CommonState).EditSuccess);
	};
}

export const OrderUtilsInstance = new OrderUtils();
