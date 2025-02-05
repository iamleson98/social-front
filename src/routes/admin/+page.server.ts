import { pageRequiresAuthentication } from "$lib/api/client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  await pageRequiresAuthentication(event);

  return {
    meta: {
      title: "Admin page",
    },
  };
};
