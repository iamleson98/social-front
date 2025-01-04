import { HTTPStatusSuccess } from "$lib/utils/consts";
import type { PageServerLoad } from "./$types";
import { tServer } from "$lib/i18n";

export const load: PageServerLoad = async (event) => {
  return {
    status: HTTPStatusSuccess,
    meta: {
      title: tServer(event, 'resetPassword.title'),
      description: "Reset your password by providing your email address",
    }
  };
};
