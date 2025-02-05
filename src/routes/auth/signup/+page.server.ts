import { type Actions } from "@sveltejs/kit";
import { ACCESS_TOKEN_KEY, CHANNEL_KEY, CSRF_TOKEN_KEY, defaultChannel, HTTPStatusBadRequest, HTTPStatusSuccess, REFRESH_TOKEN_KEY } from "$lib/utils/consts";
import { performServerSideGraphqlRequest } from "$lib/api/client";
import type { Mutation } from "$lib/gql/graphql";
import { tranFunc } from "$lib/i18n";
import { get } from "svelte/store";
import { PUBLIC_LOCAL_URL } from "$env/static/public";
import { USER_SIGNUP_MUTATION_STORE } from "$lib/api";


export const load = async (event) => {
  // If user is logged in but unexpectedly navigate to the signup page, 
  // We must remove the cookie
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
  if (accessToken) {
    event.cookies.delete(ACCESS_TOKEN_KEY, { path: '/' });
    event.cookies.delete(REFRESH_TOKEN_KEY, { path: '/' });
    event.cookies.delete(CSRF_TOKEN_KEY, { path: '/' });
  }

  return {
    meta: {
      title: get(tranFunc)('signup.title'),
      description: "Sign up to create an account on our platform",
    },
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
    const redirectUrl = PUBLIC_LOCAL_URL;
    const channel = event.cookies.get(CHANNEL_KEY) || defaultChannel.slug;

    if (!email || !email.toString().trim()) {
      return {
        status: HTTPStatusBadRequest,
        error: get(tranFunc)('error.invalidEmail'),
      };
    }

    if ((!password || !confirmPassword) || password !== confirmPassword) {
      return {
        status: HTTPStatusBadRequest,
        error: get(tranFunc)('error.passwordsNotMatch'),
      };
    }

    const variables = {
      input: {
        email,
        password,
        firstName,
        lastName,
        redirectUrl,
        channel,
      },
    };

    const result = await performServerSideGraphqlRequest<Pick<Mutation, 'accountRegister'>>('mutation', USER_SIGNUP_MUTATION_STORE, variables, event);
    if (result.error) {
      return {
        status: HTTPStatusBadRequest,
        error: result.error.message,
      };
    }

    if (result.data?.accountRegister?.errors.length) {
      return {
        status: HTTPStatusBadRequest,
        error: result.data?.accountRegister.errors[0].message as string,
      };
    }

    return {
      status: HTTPStatusSuccess,
      message: result.data?.accountRegister?.requiresConfirmation,
    };
  },
} satisfies Actions;
