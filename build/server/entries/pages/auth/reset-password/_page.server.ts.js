import { a as USER_ME_QUERY_STORE, b as USER_REQUEST_PASSWORD_RESET_MUTATION_STORE } from "../../../../chunks/auth.js";
import { A as AppRoute } from "../../../../chunks/routes.js";
import { A as ACCESS_TOKEN_KEY, a as HTTPStatusServerError, H as HTTPStatusSuccess, b as HTTPStatusBadRequest, d as defaultChannel, c as HTTPStatusPermanentRedirect } from "../../../../chunks/consts.js";
import { r as redirect } from "../../../../chunks/index.js";
import { g as graphqlClient } from "../../../../chunks/client.js";
const load = async (event) => {
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
  if (accessToken) {
    const meResult = await graphqlClient.backendQuery(USER_ME_QUERY_STORE, {}, event);
    if (meResult.error) {
      return {
        status: HTTPStatusServerError,
        error: meResult.error.message
      };
    }
    if (meResult.data?.me) {
      redirect(HTTPStatusPermanentRedirect, AppRoute.HOME);
    }
  }
  return {
    status: HTTPStatusSuccess,
    meta: {
      title: "Reset Password",
      description: "Reset your password by providing your email address"
    }
  };
};
const actions = {
  request_password_reset: async function(event) {
    const formData = await event.request.formData();
    const email = formData.get("email");
    if (!email || !email.toString().trim()) {
      return {
        status: HTTPStatusBadRequest,
        error: "Please provide valid email address"
      };
    }
    const variables = {
      email: email.toString().trim(),
      redirectUrl: "http://localhost:5173" + AppRoute.AUTH_CHANGE_PASSWORD,
      channel: defaultChannel.slug
    };
    const requestResult = await graphqlClient.backendMutation(USER_REQUEST_PASSWORD_RESET_MUTATION_STORE, variables, event);
    if (requestResult.error) {
      return {
        status: HTTPStatusServerError,
        error: requestResult.error.message
      };
    }
    if (requestResult.data?.requestPasswordReset?.errors.length) {
      return {
        status: HTTPStatusServerError,
        error: requestResult.data.requestPasswordReset.errors[0].message
      };
    }
    return {
      status: HTTPStatusSuccess,
      data: `Password reset link has been sent to ${email}. Please check your inbox.`
    };
  }
};
export {
  actions,
  load
};
