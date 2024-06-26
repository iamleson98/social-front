// import type { ProductCountableConnection } from "$lib/gql/graphql";
// import { PRODUCT_LIST_QUERY_STORE } from "$lib/stores/api/product";
import {  HTTPStatusSuccess } from "$lib/utils/types";
import type { PageServerLoad } from "./auth/signin/$types";


export const load: PageServerLoad = async () => {
  // const productsListResult = await PRODUCT_LIST_QUERY_STORE.fetch({
  //   event,
  //   variables: {
  //     channel: "default-channel",
  //     first: 10,
  //   },
  // });

  // if (productsListResult.errors?.length) {
  //   return {
  //     status: HTTPStatusServerError,
  //     error: productsListResult.errors[0].message as string,
  //   };
  // }

  return {
    status: HTTPStatusSuccess,
    // data: productsListResult.data?.products as ProductCountableConnection,
  };
};
