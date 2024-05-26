import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ACCESS_TOKEN_KEY, CSRF_TOKEN_KEY, REFRESH_TOKEN_KEY } from "$lib/stores/auth/store";
import { HTTPStatusBadRequest, HTTPStatusSuccess } from "$lib/utils/types";
import { USER_SIGNUP_MUTATION_STORE } from "$lib/stores/api";
import type { Signup$input } from "$houdini";

export const load: PageServerLoad = async (event) => {
  // If user is logged in but unexpectedly navigate to the signup page, 
  // We must remove the cookie
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY)
  if (accessToken) {
    event.cookies.delete(ACCESS_TOKEN_KEY, { path: '/' });
    event.cookies.delete(REFRESH_TOKEN_KEY, { path: '/' });
    event.cookies.delete(CSRF_TOKEN_KEY, { path: '/' });
  }

  return {
    status: HTTPStatusSuccess,
  };
}

export const actions = {
  signup: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const confirmPassword = formData.get('confirmPassword')?.toString();
    const firstName = formData.get('firstName')?.toString();
    const lastName = formData.get('lastName')?.toString();

    if (!email || !email.toString().trim()) {
      return {
        status: HTTPStatusBadRequest,
        message: "Please provide a valid email address",
      };
    }

    if (!password || !confirmPassword || password !== confirmPassword) {
      return {
        status: HTTPStatusBadRequest,
        message: "Passwords do not match",
      };
    }

    const variables: Signup$input = {
      input: {
        email,
        password,
        firstName,
        lastName,
      },
    };
    USER_SIGNUP_MUTATION_STORE.mutate(variables, { event });
  },
} satisfies Actions;
