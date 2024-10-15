import { cookieOpts, performBackendOperation } from '$lib/client.js';
import type { CheckoutCreateInput, Mutation } from '$lib/gql/graphql';
import { CHECKOUT_CREATE_MUTATION } from '$lib/stores/api/checkout.js';
import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts.js';
import { json } from '@sveltejs/kit';


export const POST = async (event) => {
  const { channel, checkoutId, lines } = await event.request.json();

  const realChannel = channel || event.cookies.get(CHANNEL_KEY) || defaultChannel.slug;
  let realCheckoutID = checkoutId || event.cookies.get(`checkout-${realChannel}`);

  if (realCheckoutID)
    return json({
      id: realCheckoutID,
    });

  const checkoutCreateResult = await performBackendOperation<Pick<Mutation, 'checkoutCreate'>, CheckoutCreateInput>(
    'mutation',
    CHECKOUT_CREATE_MUTATION,
    { channel: realChannel, lines },
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
  event.cookies.set(`checkout-${realChannel}`, realCheckoutID, { ...cookieOpts, httpOnly: true });
  return json({
    id: realCheckoutID,
  });
};
