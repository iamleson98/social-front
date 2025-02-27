import { HTTPStatusSuccess } from "$lib/utils/consts";
import { tranFunc } from "$lib/i18n";
import { get } from "svelte/store";

export const load = async () => {
  return {
    status: HTTPStatusSuccess,
    meta: {
      title: get(tranFunc)('resetPassword.title'),
      description: "Reset your password by providing your email address",
    }
  };
};
