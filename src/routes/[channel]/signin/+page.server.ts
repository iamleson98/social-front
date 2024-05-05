import { graphql } from '$houdini';
import { accessTokenKey } from '$lib/stores/auth/store.js';
import { HTTPStatusBadRequest, HTTPStatusSuccess } from '$lib/utils/types.js';

export const actions = {
  async signin(event) {
    const credentials = await event.request.formData();
    const email = credentials.get('email') as string || '';
    const password = credentials.get('password') as string || '';

    if (!email.trim() || !password) {
      return {
        status: HTTPStatusBadRequest,
        error: 'Please, provide valid email and password',
      };
    }

    const loginStore = graphql(`mutation TokenCreate($email: String!, $password: String!) {
			tokenCreate(email: $email, password: $password) {
				token
				user {
					id
					email
					firstName
					lastName
				}
				errors {
					code
					message
					field
				}
			}
		}`);

    const result = await loginStore.mutate({ email, password }, { event });

    if (result.data?.tokenCreate?.errors.length) {
      return {
        status: HTTPStatusBadRequest,
        error: result.data.tokenCreate.errors[0].message,
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
      data: result.data?.tokenCreate?.user,
    };
  },
};
