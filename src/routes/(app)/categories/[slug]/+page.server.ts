import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { HTTPStatusBadRequest } from "$lib/utils/consts";

export const load: PageServerLoad = async (event) => {
  const slug = event.params.slug.trim();

  if (!slug) {
    return error(HTTPStatusBadRequest, {
      message: "Invalid category slug",
    });
  }

  
};
