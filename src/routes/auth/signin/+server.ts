import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { ACCESS_TOKEN_KEY, CSRF_TOKEN_KEY, HTTPStatusBadRequest, HTTPStatusServerError, HTTPStatusSuccess, REFRESH_TOKEN_KEY } from "$lib/utils/consts";
import { tServer } from "$i18n";
import { cookieOpts, graphqlClient } from "$lib/client";
import type { Mutation, User } from "$lib/gql/graphql";
import { USER_LOGIN_MUTATION_STORE } from "$lib/stores/api";

type Props = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export const POST = async (event: RequestEvent) => {
  const credentials: Props = await event.request.json();
  const email = credentials.email || '';
  const password = credentials.password || '';
  const rememberMe = credentials.rememberMe || false;

  if (!email.trim() || !password) {
    return json({ error: tServer(event, 'error.invalidEmailAndPassword'), status: HTTPStatusBadRequest });
  }

  const result = await graphqlClient.backendMutation<Pick<Mutation, 'tokenCreate'>>(
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
