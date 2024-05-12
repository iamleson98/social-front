// import { graphql } from '$houdini';
import type { User } from '$lib/gql/graphql';
import { loginStore } from '$lib/stores/api';
import { accessTokenKey } from '$lib/stores/auth/store.js';
import { HTTPStatusBadRequest, HTTPStatusSuccess, type SocialResponse } from '$lib/utils/types.js';
import type { Actions } from './$types';

export const actions = {
  signin: async (event): Promise<SocialResponse<User>> => {
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
      status: HTTPStatusSuccess,
      data: result.data?.tokenCreate?.user as User,
    };
  },
} satisfies Actions;
