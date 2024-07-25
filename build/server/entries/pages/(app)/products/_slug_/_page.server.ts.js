import { P as PRODUCT_DETAIL_QUERY_STORE } from "../../../../../chunks/product.js";
import { C as CHANNEL_KEY, a as HTTPStatusServerError, H as HTTPStatusSuccess, b as HTTPStatusBadRequest, d as defaultChannel } from "../../../../../chunks/consts.js";
import { e as error } from "../../../../../chunks/index.js";
import { g as graphqlClient } from "../../../../../chunks/client.js";
const load = async (event) => {
  console.log(event.url.searchParams.get("tab"));
  const slug = event.params.slug.trim();
  if (!slug) {
    return error(
      HTTPStatusBadRequest,
      { message: "Invalid product slug" }
    );
  }
  let channel = event.cookies.get(CHANNEL_KEY);
  if (!channel) {
    channel = defaultChannel.slug;
  }
  const variables = {
    slug,
    channel
  };
  const productDetailResult = await graphqlClient.backendQuery(PRODUCT_DETAIL_QUERY_STORE, variables, event, { requestPolicy: "network-only" });
  if (productDetailResult.error) {
    return error(HTTPStatusServerError, {
      message: productDetailResult.error.message
    });
  }
  return {
    status: HTTPStatusSuccess,
    data: productDetailResult.data?.product,
    meta: {
      title: productDetailResult.data?.product?.name
    }
  };
};
export {
  load
};
