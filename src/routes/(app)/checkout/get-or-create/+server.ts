import { cookieOpts, performBackendOperation } from '$lib/client.js';
import type { CheckoutCreateInput, Mutation, Query } from '$lib/gql/graphql';
import { CHECKOUT_CREATE_MUTATION, CHECKOUT_PREVIEW_QUERY } from '$lib/stores/api/checkout.js';
import { CHANNEL_KEY, defaultChannel, findChannelBySlug } from '$lib/utils/consts.js';
import type { CustomQueryCheckoutArgs } from '$lib/utils/types.js';
import { json } from '@sveltejs/kit';


export const POST = async (event) => {
  const { channel, checkoutId, lines } = await event.request.json();

  const realChannel = channel || event.cookies.get(CHANNEL_KEY) || defaultChannel.slug;
  const realCheckoutID = checkoutId || event.cookies.get(`checkout-${realChannel}`);

  if (realCheckoutID) {
    const checkoutResult = await performBackendOperation<Pick<Query, 'checkout'>, CustomQueryCheckoutArgs>(
      'query',
      CHECKOUT_PREVIEW_QUERY,
      {
        id: realCheckoutID,
        languageCode: findChannelBySlug(realChannel).locale,
      },
      event,
      { requestPolicy: 'network-only' }
    );
    if (checkoutResult.error) return json({ error: checkoutResult.error.message });

    return json({
      checkout: checkoutResult.data?.checkout,
    });
  }

  const checkoutCreateResult = await performBackendOperation<Pick<Mutation, 'checkoutCreate'>, CheckoutCreateInput>(
    'mutation',
    CHECKOUT_CREATE_MUTATION,
    { channel: realChannel, lines: lines ? lines : [] },
    event,
    { requestPolicy: 'network-only' },
  );

  if (checkoutCreateResult.error)
    return json({ error: checkoutCreateResult.error.message });

  if (checkoutCreateResult.data?.checkoutCreate?.errors.length)
    return json({ error: checkoutCreateResult.data.checkoutCreate.errors[0].message as string });

  event.cookies.set(`checkout-${realChannel}`, checkoutCreateResult.data?.checkoutCreate?.checkout?.id as string, cookieOpts);
  return json({
    checkout: checkoutCreateResult.data?.checkoutCreate?.checkout,
  });
};
