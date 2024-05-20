import { USER_REQUEST_PASSWORD_RESET_MUTATION_STORE } from "$lib/stores/api/auth";
import { AppRoute } from "$lib/utils";
import { DEFAULT_CHANNEL_NAME, HTTPStatusBadRequest, HTTPStatusServerError, HTTPStatusSuccess, type SocialResponse } from "$lib/utils/types";
import type { Actions } from "@sveltejs/kit";

export const actions = {
  request_password_reset: async function (event): Promise<SocialResponse<unknown>> {
    const formData = await event.request.formData();
    const email = formData.get('email');

    if (!email || !email.toString().trim()) {
      return {
        status: HTTPStatusBadRequest,
        error: "Please provide valid email address",
      };
    }

    const requestResult = await USER_REQUEST_PASSWORD_RESET_MUTATION_STORE.mutate({
      email: email.toString().trim(),
      redirectUrl: AppRoute.PASSWORD_RESET_REDIRECT,
      channel: DEFAULT_CHANNEL_NAME,
    }, { event });

    if (requestResult.errors?.length) {
      return {
        status: HTTPStatusServerError,
        error: requestResult.errors[0].message,
      };
    }

    if (requestResult.data?.requestPasswordReset?.errors.length) {
      return {
        status: HTTPStatusServerError,
        error: requestResult.data.requestPasswordReset.errors[0].message as string,
      };
    }

    return {
      status: HTTPStatusSuccess,
      data: `Password reset link has been sent to ${email}. Please check your inbox.`
    };
  },
} satisfies Actions;

