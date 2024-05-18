import type { ProductCountableConnection } from "$lib/gql/graphql";
import { productListStore } from "$lib/stores/api/product";
import { HTTPStatusServerError, HTTPStatusSuccess } from "$lib/utils/types";
import type { PageServerLoad } from "./auth/signin/$types";


export const load: PageServerLoad = async (event) => {
  const productsListResult = await productListStore.fetch({
    event,
    variables: {
      channel: "default-channel",
      first: 10,
    },
  });

  if (productsListResult.errors?.length) {
    return {
      status: HTTPStatusServerError,
      error: productsListResult.errors[0].message as string,
    };
  }

  return {
    status: HTTPStatusSuccess,
    data: productsListResult.data?.products as ProductCountableConnection,
  };
};
