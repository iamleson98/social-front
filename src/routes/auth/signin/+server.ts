import { json } from "@sveltejs/kit";
import { ACCESS_TOKEN_KEY, CSRF_TOKEN_KEY, HTTPStatusBadRequest, HTTPStatusServerError, HTTPStatusSuccess, REFRESH_TOKEN_KEY } from "$lib/utils/consts";
import { tranFunc } from "$i18n";
import { cookieOpts, performServerSideGraphqlRequest } from "$lib/api/client";
import type { Mutation, User } from "$lib/gql/graphql";
import { USER_LOGIN_MUTATION_STORE } from "$lib/stores/api";
import { get } from "svelte/store";

type Props = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export const POST = async (event) => {
  const credentials: Props = await event.request.json();
  const email = credentials.email || '';
  const password = credentials.password || '';
  const rememberMe = credentials.rememberMe || false;

  if (!email.trim() || !password) {
    return json({ error: get(tranFunc)('error.invalidEmailAndPassword'), status: HTTPStatusBadRequest });
  }

  const result = await performServerSideGraphqlRequest<Pick<Mutation, 'tokenCreate'>>(
    'mutation',
    USER_LOGIN_MUTATION_STORE,
    { email, password },
    event,
    { requestPolicy: 'network-only' }
  );

  if (result.error) {
    return json({ error: result.error.message, status: HTTPStatusServerError });
  }

  if (result.data?.tokenCreate?.errors.length) {
    return json({ error: result.data.tokenCreate.errors[0].message as string, status: HTTPStatusBadRequest });
  }

  const authTokenCookieOpts = { ...cookieOpts, maxAge: rememberMe ? 60 * 60 * 24 : undefined };

  event.cookies.set(ACCESS_TOKEN_KEY, result.data?.tokenCreate?.token as string, authTokenCookieOpts);
  event.cookies.set(CSRF_TOKEN_KEY, result.data?.tokenCreate?.csrfToken as string, authTokenCookieOpts);
  event.cookies.set(REFRESH_TOKEN_KEY, result.data?.tokenCreate?.refreshToken as string, authTokenCookieOpts);

  return json({
    data: result.data?.tokenCreate?.user as User,
    status: HTTPStatusSuccess,
  });

};
