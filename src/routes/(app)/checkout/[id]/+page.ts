import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { defaultChannel, HTTPStatusBadRequest, HTTPStatusServerError } from "$lib/utils/consts";
import { graphqlClient } from "$lib/client";
import { CHECKOUT_FIND_QUERY } from "$lib/stores/api/checkout";
import type { Checkout, LanguageCodeEnum, Query, QueryCheckoutArgs } from "$lib/gql/graphql";


type CustomQueryCheckoutArgs = { languageCode: LanguageCodeEnum } & QueryCheckoutArgs;

export const load: PageLoad = async (event) => {
  const { id } = event.params;

  if (!/^[a-zA-Z0-9]+$/g.test(id))
    return error(HTTPStatusBadRequest, {
      message: "Invalid checkout ID",
    });

  const result = await graphqlClient
    .query<Pick<Query, 'checkout'>, CustomQueryCheckoutArgs>(
      CHECKOUT_FIND_QUERY,
      {
        id,
        languageCode: defaultChannel.locale
      },
      { requestPolicy: 'network-only' }
    )
    .toPromise();

  if (result.error)
    return error(HTTPStatusServerError, {
      message: result.error.message,
    });

  return {
    meta: {
      title: "Checkout",
    },
    checkout: result.data?.checkout as Checkout,
  };
};
