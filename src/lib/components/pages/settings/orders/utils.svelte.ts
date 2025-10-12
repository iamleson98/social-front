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
	ORDER_DISCOUNT_DELETE_MUTATION,
	ORDER_DRAFT_FINALIZE_MUTATION,
	ORDER_FULFILLMENT_APPROVE_MUTATION,
	ORDER_FULFILLMENT_UPDATE_TRACKING_MUTATION,
	ORDER_LINE_DELETE_MUTATION,
	ORDER_LINE_DISCOUNT_REMOVE_MUTATION,
	ORDER_LINE_DISCOUNT_UPDATE_MUTATION,
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
	MutationOrderDiscountDeleteArgs,
	MutationOrderFulfillmentApproveArgs,
	MutationOrderFulfillmentCancelArgs,
	MutationOrderFulfillmentUpdateTrackingArgs,
	MutationOrderLineDeleteArgs,
	MutationOrderLineDiscountRemoveArgs,
	MutationOrderLineDiscountUpdateArgs,
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
import { get, writable } from 'svelte/store';

function OrderUtils() {
	const state = $state({
		loading: false,
	});

	const orderVoid = async (id: string) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderVoid'>,
			MutationOrderVoidArgs
		>(ORDER_VOID_MUTATION, {
			id,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderVoid', get(CommonState).EditSuccess);
	};

	const orderCancel = async (id: string) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderCancel'>,
			MutationOrderCancelArgs
		>(ORDER_CANCEL_MUTATION, {
			id,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderCancel', get(CommonState).EditSuccess);
	};

	const paymentCapture = async (id: string, amount: number) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderCapture'>,
			MutationOrderCaptureArgs
		>(ORDER_CAPTURE_MUTATION, {
			id,
			amount,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderCapture', get(CommonState).EditSuccess);
	};

	const orderAddNote = async (id: string, input: OrderAddNoteInput) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderAddNote'>,
			MutationOrderAddNoteArgs
		>(ORDER_ADD_NOTE_MUTATION, {
			order: id,
			input,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderAddNote', get(CommonState).EditSuccess);
	};

	const orderUpdateNote = async (id: string, input: OrderNoteInput) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderNoteUpdate'>,
			MutationOrderNoteUpdateArgs
		>(ORDER_UPDATE_NOTE_MUTATION, {
			note: id,
			input,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderNoteUpdate', get(CommonState).EditSuccess);
	};

	const draftOrderUpdate = async (id: string, input: DraftOrderInput) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'draftOrderUpdate'>,
			MutationDraftOrderUpdateArgs
		>(DRAFT_ORDER_UPDATE_MUTATION, {
			id,
			input,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'draftOrderUpdate', get(CommonState).EditSuccess);
	};

	const updateShippingMethod = async (order: string, input: OrderUpdateShippingInput) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderUpdateShipping'>,
			MutationOrderUpdateShippingArgs
		>(ORDER_SHIPPING_UPDATE_MUTATION, {
			order,
			input,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(
			result,
			'orderUpdateShipping',
			get(CommonState).EditSuccess,
		);
	};

	const deleteOrderLine = async (id: string) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderLineDelete'>,
			MutationOrderLineDeleteArgs
		>(ORDER_LINE_DELETE_MUTATION, {
			id,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderLineDelete', get(CommonState).EditSuccess);
	};

	const addOrderLines = async (id: string, input: OrderLineCreateInput[]) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderLinesCreate'>,
			MutationOrderLinesCreateArgs
		>(ORDER_LINES_ADD_MUTATION, {
			id,
			input,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderLinesCreate', get(CommonState).EditSuccess);
	};

	const updateOrderLine = async (id: string, input: OrderLineInput) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderLineUpdate'>,
			MutationOrderLineUpdateArgs
		>(ORDER_LINE_UPDATE_MUTATION, {
			id,
			input,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderLineUpdate', get(CommonState).EditSuccess);
	};

	const approveFulfillment = async (
		id: string,
		notifyCustomer: boolean,
		allowStockToBeExceeded?: boolean,
	) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderFulfillmentApprove'>,
			MutationOrderFulfillmentApproveArgs
		>(ORDER_FULFILLMENT_APPROVE_MUTATION, {
			id,
			notifyCustomer,
			allowStockToBeExceeded,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(
			result,
			'orderFulfillmentApprove',
			get(CommonState).EditSuccess,
		);
	};

	const cancelFulfillment = async (id: string, input?: FulfillmentCancelInput) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderFulfillmentCancel'>,
			MutationOrderFulfillmentCancelArgs
		>(ORDER_CANCEL_FULFILLMENT_MUTATION, {
			id,
			input,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(
			result,
			'orderFulfillmentCancel',
			get(CommonState).EditSuccess,
		);
	};

	const orderFulfillmentUpdateTracking = async (id: string, input: FulfillmentUpdateTrackingInput) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderFulfillmentUpdateTracking'>,
			MutationOrderFulfillmentUpdateTrackingArgs
		>(ORDER_FULFILLMENT_UPDATE_TRACKING_MUTATION, {
			id,
			input,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(
			result,
			'orderFulfillmentUpdateTracking',
			get(CommonState).EditSuccess,
		);
	};

	const finalizeDraftOrder = async (id: string) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'draftOrderComplete'>,
			MutationDraftOrderCompleteArgs
		>(ORDER_DRAFT_FINALIZE_MUTATION, {
			id,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'draftOrderComplete', get(CommonState).EditSuccess);
	};

	const deleteDraftOrder = async (id: string, externalReference?: string) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'draftOrderDelete'>,
			MutationDraftOrderDeleteArgs
		>(DRAFT_ORDER_DELETE_MUTATION, {
			id,
			externalReference,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'draftOrderDelete', get(CommonState).DeleteSuccess);
	};

	const markAsPaid = async (id: string, transactionReference?: string) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderMarkAsPaid'>,
			MutationOrderMarkAsPaidArgs
		>(ORDER_MARK_AS_PAID_MUTATION, {
			id,
			transactionReference,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderMarkAsPaid', get(CommonState).EditSuccess);
	};

	const invoiceRequest = async (id: string, number?: string) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'invoiceRequest'>,
			MutationInvoiceRequestArgs
		>(INVOICE_REQUEST_MUTATION, {
			orderId: id,
			number,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'invoiceRequest', get(CommonState).EditSuccess);
	};

	const invoiceSendNotification = async (id: string) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'invoiceSendNotification'>,
			MutationInvoiceSendNotificationArgs
		>(INVOICE_EMAIL_SEND_MUTATION, {
			id,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(
			result,
			'invoiceSendNotification',
			get(CommonState).EditSuccess,
		);
	};

	const transactionActionSend = async (
		actionType: TransactionActionEnum,
		amount?: number,
		id?: string,
		token?: string,
	) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'transactionRequestAction'>,
			MutationTransactionRequestActionArgs
		>(ORDER_TRANSACTION_REQUEST_ACTION_MUTATION, {
			id,
			actionType,
			amount,
			token,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(
			result,
			'transactionRequestAction',
			get(CommonState).EditSuccess,
		);
	};

	const transactionCreate = async (
		id: string,
		transaction: TransactionCreateInput,
		transactionEvent: TransactionEventInput,
	) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'transactionCreate'>,
			MutationTransactionCreateArgs
		>(TRANSACTION_CREATE_MUTATION, {
			id,
			transaction,
			transactionEvent,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'transactionCreate', get(CommonState).EditSuccess);
	};

	const orderAddDiscount = async (orderId: string, input: OrderDiscountCommonInput) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderDiscountAdd'>,
			MutationOrderDiscountAddArgs
		>(ORDER_DISCOUNT_ADD_MUTATION, {
			orderId,
			input,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderDiscountAdd', get(CommonState).EditSuccess);
	};

	const orderLineDiscountUpdate = async (orderLineId: string, input: OrderDiscountCommonInput) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderLineDiscountUpdate'>,
			MutationOrderLineDiscountUpdateArgs
		>(ORDER_LINE_DISCOUNT_UPDATE_MUTATION, {
			orderLineId,
			input,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderLineDiscountUpdate', get(CommonState).EditSuccess);
	}

	const orderLineDiscountRemove = async (orderLineId: string) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderLineDiscountRemove'>,
			MutationOrderLineDiscountRemoveArgs
		>(ORDER_LINE_DISCOUNT_REMOVE_MUTATION, {
			orderLineId,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderLineDiscountRemove', get(CommonState).EditSuccess);
	}

	const orderDiscountDelete = async (discountId: string) => {
		state.loading = (true);
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderDiscountDelete'>,
			MutationOrderDiscountDeleteArgs
		>(ORDER_DISCOUNT_DELETE_MUTATION, {
			discountId,
		});
		state.loading = (false);
		return checkIfGraphqlResultHasError(result, 'orderDiscountDelete', get(CommonState).EditSuccess);
	}

	return {
		state,
		approveFulfillment,
		cancelFulfillment,
		orderFulfillmentUpdateTracking,
		finalizeDraftOrder,
		deleteDraftOrder,
		markAsPaid,
		invoiceRequest,
		invoiceSendNotification,
		transactionActionSend,
		transactionCreate,
		orderAddDiscount,
		orderLineDiscountUpdate,
		addOrderLines,
		deleteOrderLine,
		updateOrderLine,
		orderUpdateNote,
		orderCancel,
		orderVoid,
		paymentCapture,
		orderAddNote,
		draftOrderUpdate,
		updateShippingMethod,
		orderLineDiscountRemove,
		orderDiscountDelete,
	}
}

export const OrderUtilsInstance = OrderUtils();
