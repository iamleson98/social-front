import { g as graphqlClient } from "../../../../chunks/client.js";
import { U as USER_SET_PASSWORD_MUTATION_STORE } from "../../../../chunks/auth.js";
import { H as HTTPStatusSuccess, b as HTTPStatusBadRequest, a as HTTPStatusServerError } from "../../../../chunks/consts.js";
const load = async () => {
  return {
    status: HTTPStatusSuccess,
    meta: {
      title: "Change Password",
      description: "Change your password by providing your new password"
    }
  };
};
const actions = {
  default: async function(event) {
    const formData = await event.request.formData();
    const password = formData.get("newPassword")?.toString();
    const confirmNewPassword = formData.get("confirmNewPassword")?.toString();
    if (!password || !confirmNewPassword) {
      return {
        status: HTTPStatusBadRequest,
        error: "Please provide valid new passwords"
      };
    }
    if (password !== confirmNewPassword) {
      return {
        status: HTTPStatusBadRequest,
        error: "password and confirm password don't match."
      };
    }
    const token = event.url.searchParams.get("token");
    const email = event.url.searchParams.get("email");
    if (!token || !email) {
      return {
        status: HTTPStatusBadRequest,
        error: "Invalid url"
      };
    }
    const variables = {
      email,
      token,
      password
    };
    const resetNewPasswordResult = await graphqlClient.backendMutation(USER_SET_PASSWORD_MUTATION_STORE, variables, event);
    if (resetNewPasswordResult.error) {
      return {
        status: HTTPStatusServerError,
        error: resetNewPasswordResult.error.message
      };
    }
    if (resetNewPasswordResult.data?.setPassword?.errors.length) {
      return {
        status: HTTPStatusBadRequest,
        error: resetNewPasswordResult.data.setPassword.errors[0].message
      };
    }
    return {
      status: HTTPStatusSuccess,
      data: `Password reset successfully. Redirecting to sign in page...`
    };
  }
};
export {
  actions,
  load
};
