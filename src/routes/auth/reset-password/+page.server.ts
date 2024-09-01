import { USER_ME_QUERY_STORE, USER_REQUEST_PASSWORD_RESET_MUTATION_STORE } from "$lib/stores/api/auth";
import { AppRoute } from "$lib/utils";
import { ACCESS_TOKEN_KEY, defaultChannel, HTTPStatusBadRequest, HTTPStatusPermanentRedirect, HTTPStatusServerError, HTTPStatusSuccess, type SocialResponse } from "$lib/utils/consts";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { performBackendOperation } from "$lib/client";
import type { Mutation, Query } from "$lib/gql/graphql";
import { tServer } from "$lib/i18n";

export const load: PageServerLoad = async (event) => {
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);

  // check if authenticated user unexpectedly landed on this page
  if (accessToken) {
    const meResult = await performBackendOperation<Pick<Query, 'me'>>('query', USER_ME_QUERY_STORE, {}, event);
    if (meResult.error) {
      return {
        status: HTTPStatusServerError,
        error: meResult.error.message,
      };
    }
    if (meResult.data?.me) {
      redirect(HTTPStatusPermanentRedirect, AppRoute.HOME);
    }
  }

  return {
    status: HTTPStatusSuccess,
    meta: {
      title: tServer(event, 'resetPassword.title'),
      description: "Reset your password by providing your email address",
    }
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
      channel: defaultChannel.slug,
    };
    const requestResult = await performBackendOperation<Pick<Mutation, 'requestPasswordReset'>>('mutation', USER_REQUEST_PASSWORD_RESET_MUTATION_STORE, variables, event);
    if (requestResult.error) {
      return {
        status: HTTPStatusServerError,
        error: requestResult.error.message,
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

