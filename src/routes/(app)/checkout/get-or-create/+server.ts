import { cookieOpts, performBackendOperation } from '$lib/client.js';
import type { Mutation, Query } from '$lib/gql/graphql';
import { CHECKOUT_CREATE_MUTATION, CHECKOUT_FIND_QUERY } from '$lib/stores/api/checkout.js';
import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts.js';
import { json } from '@sveltejs/kit';

export const POST = async (event) => {
  const { channel, checkoutId } = await event.request.json();

  const realChannel = channel || event.cookies.get(CHANNEL_KEY) || defaultChannel.slug;
  let realCheckoutID = checkoutId || event.cookies.get(`checkout-${realChannel}`);

  if (!realCheckoutID) {
    const checkoutCreateResult = await performBackendOperation<Pick<Mutation, 'checkoutCreate'>>(
      'mutation',
      CHECKOUT_CREATE_MUTATION,
      { channel: realChannel },
      event,
      { requestPolicy: 'network-only' },
    );

    if (checkoutCreateResult.error) {
      return json({ error: checkoutCreateResult.error.message });
    }
    if (checkoutCreateResult.data?.checkoutCreate?.errors.length) {
      return json({ error: checkoutCreateResult.data.checkoutCreate.errors[0].message as string });
    }

    realCheckoutID = checkoutCreateResult.data?.checkoutCreate?.checkout?.id;
    event.cookies.set(`checkout-${realChannel}`, realCheckoutID, cookieOpts);

    return json({
      checkout: checkoutCreateResult.data?.checkoutCreate?.checkout
    })
  }

  const checkoutQueryResult = await performBackendOperation<Pick<Query, 'checkout'>>(
    'query',
    CHECKOUT_FIND_QUERY,
    { id: realCheckoutID, },
    event,
    { requestPolicy: 'network-only' },
  );

  return json({
    checkout: checkoutQueryResult.data?.checkout,
  });
};
