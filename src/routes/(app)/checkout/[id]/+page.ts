import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { HTTPStatusBadRequest } from "$lib/utils/consts";


export const load: PageLoad = async (event) => {
  const { id } = event.params;

  if (!/^[a-zA-Z0-9]+$/g.test(id))
    return error(HTTPStatusBadRequest, {
      message: "Invalid checkout ID",
    });

  return {
    meta: {
      title: "Checkout",
    },
  };
};
