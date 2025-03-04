import { HTTPStatusSuccess } from "$lib/utils/consts";
import { serverSideTranslate } from "$lib/i18n";

export const load = async (event) => {
  return {
    status: HTTPStatusSuccess,
    meta: {
      title: await serverSideTranslate('resetPassword.title', event),
      description: "Reset your password by providing your email address",
    }
  };
};
