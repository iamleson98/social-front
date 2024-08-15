import { HTTPStatusSuccess } from "$lib/utils/consts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    status: HTTPStatusSuccess,
  };
};
