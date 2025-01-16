import { cookieOpts, performBackendOperation } from "$lib/client";
import type { Checkout, CheckoutCreateInput, Mutation, Query } from "$lib/gql/graphql";
import { CHECKOUT_CREATE_MUTATION, CHECKOUT_DETAILS_QUERY, CHECKOUT_PREVIEW_QUERY } from "$lib/stores/api/checkout";
import { CHANNEL_KEY, defaultChannel, HTTPStatusBadRequest, HTTPStatusServerError, HTTPStatusSuccess } from "$lib/utils/consts";
import type { CustomQueryCheckoutArgs } from "$lib/utils/types";
import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";


export const GET = async (event: RequestEvent) => {
  const channelSlug = event.cookies.get(CHANNEL_KEY) || defaultChannel.slug;
  const checkoutId = event.cookies.get(`checkout-${channelSlug}`);

  if (checkoutId) {
    const checkoutResult = await performBackendOperation<Pick<Query, 'checkout'>, CustomQueryCheckoutArgs>(
      'query',
      CHECKOUT_PREVIEW_QUERY,
      { id: checkoutId },
      event,
      { requestPolicy: 'network-only' },
    );

    if (checkoutResult.data?.checkout)
      return json({
        status: HTTPStatusSuccess,
        checkout: checkoutResult.data?.checkout,
      });

    // if we reach here, meaning the checkout is stale now
    // delete the checkout cookie and move on to create one
    event.cookies.delete(`checkout-${channelSlug}`, { ...cookieOpts, httpOnly: true });
  }

  const checkoutCreateResult = await performBackendOperation<Pick<Mutation, 'checkoutCreate'>, CheckoutCreateInput>(
    'mutation',
    CHECKOUT_CREATE_MUTATION,
    { channel: channelSlug, lines: [] },
    event,
    { requestPolicy: 'network-only' },
  );
  if (checkoutCreateResult.error)
    return json({
      status: HTTPStatusServerError,
      message: checkoutCreateResult.error.message,
    });

  if (checkoutCreateResult.data?.checkoutCreate?.errors.length) {
    return json({
      status: HTTPStatusBadRequest,
      message: checkoutCreateResult.data.checkoutCreate.errors[0].message as string,
    });
  }

  event.cookies.set(`checkout-${channelSlug}`, checkoutCreateResult.data?.checkoutCreate?.checkout?.id as string, { ...cookieOpts, httpOnly: true });
  return json({
    status: HTTPStatusSuccess,
    checkout: checkoutCreateResult.data?.checkoutCreate?.checkout as Checkout,
  });
};
