import type { User } from '$lib/gql/graphql';
import { loginStore, queryUserStore } from '$lib/stores/api';
import { accessTokenKey } from '$lib/stores/auth/store.js';
import { HTTPStatusBadRequest, HTTPStatusServerError, HTTPStatusSuccess, HTTPStatusTemporaryRedirect } from '$lib/utils/types.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppRoute } from '$lib/utils';

export const load: PageServerLoad = async (event) => {
  const accessToken = event.cookies.get(accessTokenKey);

  if (accessToken) {
    const result = await queryUserStore.fetch({ event });

    if (result.errors?.length) {
      // means token has expired.
      error(HTTPStatusServerError, { message: result.errors[0].message as string });
    } else if (!result.data?.me) {
      return {
        status: HTTPStatusSuccess,
      };
    }
  }

  redirect(HTTPStatusTemporaryRedirect, AppRoute.HOME);
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

    const result = await loginStore.mutate({ email, password }, { event });

    if (result.data?.tokenCreate?.errors.length) {
      return {
        status: HTTPStatusBadRequest,
        error: result.data.tokenCreate.errors[0].message as string,
      };
    }

    event.cookies.set(accessTokenKey, result.data?.tokenCreate?.token as string, {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60,
    });

    return {
      user: result.data?.tokenCreate?.user as User,
    }
  },
} satisfies Actions;
