import type { User } from '$lib/gql/graphql';
import { USER_LOGIN_MUTATION_STORE, USER_ME_QUERY_STORE } from '$lib/stores/api';
import { ACCESS_TOKEN_KEY, CSRF_TOKEN, REFRESH_TOKEN } from '$lib/stores/auth/store.js';
import { HTTPStatusBadRequest, HTTPStatusSuccess, HTTPStatusTemporaryRedirect } from '$lib/utils/types.js';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppRoute } from '$lib/utils';

export const load: PageServerLoad = async (event) => {
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);

  if (accessToken) {
    const result = await USER_ME_QUERY_STORE.fetch({ event });

    if (result.errors?.length) {
      // means token has expired.
      return {
        status: HTTPStatusSuccess,
      };
    }

    redirect(HTTPStatusTemporaryRedirect, AppRoute.HOME);
  }

  return {
    status: HTTPStatusSuccess,
  };
};

export const actions = {
  signin: async (event) => {
    const credentials = await event.request.formData();
    const email = credentials.get('email') as string || '';
    const password = credentials.get('password') as string || '';

    if (!email.trim() || !password) {
      return {
        status: HTTPStatusBadRequest,
        error: 'Please, provide valid email and password',
      };
    }

    const result = await USER_LOGIN_MUTATION_STORE.mutate({ email, password }, { event });

    if (result.data?.tokenCreate?.errors.length) {
      return {
        status: HTTPStatusBadRequest,
        error: result.data.tokenCreate.errors[0].message as string,
      };
    }

    const cookieOpts = {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60,
    }
    event.cookies.set(ACCESS_TOKEN_KEY, result.data?.tokenCreate?.token as string, cookieOpts);
    event.cookies.set(CSRF_TOKEN, result.data?.tokenCreate?.csrfToken as string, cookieOpts);
    event.cookies.set(REFRESH_TOKEN, result.data?.tokenCreate?.refreshToken as string, cookieOpts);

    return {
      user: result.data?.tokenCreate?.user as User,
    }
  },
} satisfies Actions;
