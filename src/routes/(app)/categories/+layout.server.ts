import { HTTPStatusSuccess } from "$lib/utils/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
  return {
    status: HTTPStatusSuccess,
  };
};
