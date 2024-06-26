import { USER_ME_QUERY_STORE, USER_REQUEST_PASSWORD_RESET_MUTATION_STORE } from "$lib/stores/api/auth";
import { AppRoute } from "$lib/utils";
import { DEFAULT_CHANNEL_NAME, HTTPStatusBadRequest, HTTPStatusPermanentRedirect, HTTPStatusServerError, HTTPStatusSuccess, type SocialResponse } from "$lib/utils/types";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ACCESS_TOKEN_KEY } from "$lib/stores/auth/store";

export const load: PageServerLoad = async (event) => {
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);

  // check if authenticated user unexpectedly landed on this page
  if (accessToken) {
    const meResult = await USER_ME_QUERY_STORE.fetch({ event });
    if (meResult.data?.me) {
      redirect(HTTPStatusPermanentRedirect, AppRoute.HOME);
    }
  }

  return {
    status: HTTPStatusSuccess,
  };
};

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

    const variables = {
      email: email.toString().trim(),
      redirectUrl: import.meta.env.VITE_LOCAL_URL + AppRoute.AUTH_CHANGE_PASSWORD,
      channel: DEFAULT_CHANNEL_NAME,
    };
    const requestResult = await USER_REQUEST_PASSWORD_RESET_MUTATION_STORE.mutate(variables, { event });

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

