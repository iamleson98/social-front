import { A as ACCESS_TOKEN_KEY, R as REFRESH_TOKEN_KEY, e as CSRF_TOKEN_KEY, H as HTTPStatusSuccess, C as CHANNEL_KEY, d as defaultChannel, b as HTTPStatusBadRequest } from "../../../../chunks/consts.js";
import { d as USER_SIGNUP_MUTATION_STORE } from "../../../../chunks/auth.js";
import "../../../../chunks/product.js";
import { g as graphqlClient } from "../../../../chunks/client.js";
const load = async (event) => {
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
  if (accessToken) {
    event.cookies.delete(ACCESS_TOKEN_KEY, { path: "/" });
    event.cookies.delete(REFRESH_TOKEN_KEY, { path: "/" });
    event.cookies.delete(CSRF_TOKEN_KEY, { path: "/" });
  }
  return {
    status: HTTPStatusSuccess,
    meta: {
      title: "Sign Up",
      description: "Sign up to create an account on our platform"
    }
  };
};
const actions = {
  signup: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();
    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const redirectUrl = "http://localhost:5173";
    const channel = event.cookies.get(CHANNEL_KEY) || defaultChannel.slug;
    if (!email || !email.toString().trim()) {
      return {
        status: HTTPStatusBadRequest,
        error: "Please provide a valid email address"
      };
    }
    if (!password || !confirmPassword || password !== confirmPassword) {
      return {
        status: HTTPStatusBadRequest,
        error: "Passwords do not match"
      };
    }
    const variables = {
      input: {
        email,
        password,
        firstName,
        lastName,
        redirectUrl,
        channel
      }
    };
    const result = await graphqlClient.backendMutation(USER_SIGNUP_MUTATION_STORE, variables, event);
    if (result.error) {
      return {
        status: HTTPStatusBadRequest,
        error: result.error.message
      };
    }
    if (result.data?.accountRegister?.errors.length) {
      return {
        status: HTTPStatusBadRequest,
        error: result.data?.accountRegister.errors[0].message
      };
    }
    return {
      status: HTTPStatusSuccess,
      message: result.data?.accountRegister?.requiresConfirmation
    };
  }
};
export {
  actions,
  load
};
