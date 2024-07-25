import { a as USER_ME_QUERY_STORE, c as USER_LOGIN_MUTATION_STORE } from "../../../../chunks/auth.js";
import "../../../../chunks/product.js";
import { A as ACCESS_TOKEN_KEY, a as HTTPStatusServerError, H as HTTPStatusSuccess, b as HTTPStatusBadRequest, e as CSRF_TOKEN_KEY, f as HTTPStatusTemporaryRedirect } from "../../../../chunks/consts.js";
import { r as redirect } from "../../../../chunks/index.js";
import { A as AppRoute } from "../../../../chunks/routes.js";
import { g as graphqlClient } from "../../../../chunks/client.js";
const load = async (event) => {
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
  const response = {
    meta: {
      title: "Sign In"
    }
  };
  if (accessToken) {
    const result = await graphqlClient.backendQuery(
      USER_ME_QUERY_STORE,
      {},
      event
    );
    if (result.error) {
      response.status = HTTPStatusServerError;
      response.error = result.error.message;
      return response;
    }
    redirect(HTTPStatusTemporaryRedirect, AppRoute.HOME);
  }
  response.status = HTTPStatusSuccess;
  return response;
};
const actions = {
  signin: async (event) => {
    const credentials = await event.request.formData();
    const email = credentials.get("email") || "";
    const password = credentials.get("password") || "";
    if (!email.trim() || !password) {
      return {
        status: HTTPStatusBadRequest,
        error: "Please, provide valid email and password"
      };
    }
    const result = await graphqlClient.backendMutation(
      USER_LOGIN_MUTATION_STORE,
      { email, password },
      event,
      {
        requestPolicy: "network-only"
      }
    );
    if (result.error) {
      return {
        status: HTTPStatusServerError,
        error: result.error.message
      };
    }
    if (result.data?.tokenCreate?.errors.length) {
      return {
        status: HTTPStatusBadRequest,
        error: result.data.tokenCreate.errors[0].message
      };
    }
    const cookieOpts = {
      path: "/",
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60
    };
    event.cookies.set(ACCESS_TOKEN_KEY, result.data?.tokenCreate?.token, cookieOpts);
    event.cookies.set(CSRF_TOKEN_KEY, result.data?.tokenCreate?.csrfToken, cookieOpts);
    return {
      user: result.data?.tokenCreate?.user
    };
  }
};
export {
  actions,
  load
};
