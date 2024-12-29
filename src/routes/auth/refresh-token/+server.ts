import { cookieOpts, graphqlClient } from "$lib/client";
import type { Mutation, MutationTokenRefreshArgs } from "$lib/gql/graphql";
import { USER_REFRESH_TOKEN_MUTATION_STORE } from "$lib/stores/api";
import { ACCESS_TOKEN_KEY, CSRF_TOKEN_KEY, HTTPStatusPermanentRedirect, REFRESH_TOKEN_KEY } from "$lib/utils/consts";
import { json, redirect } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { AppRoute } from "$lib/utils";


type Props = {
  refreshToken: string;
  csrfToken: string;
};

export const POST = async (event: RequestEvent) => {
  event.cookies.delete(ACCESS_TOKEN_KEY, cookieOpts);

  const { refreshToken, csrfToken }: Props = await event.request.json();

  if (!refreshToken || !csrfToken) {
    redirect(HTTPStatusPermanentRedirect, AppRoute.AUTH_SIGNIN);
    return;
  }

  const result = await graphqlClient
    .mutation<Pick<Mutation, 'tokenRefresh'>, MutationTokenRefreshArgs>(
      USER_REFRESH_TOKEN_MUTATION_STORE,
      {
        refreshToken,
        csrfToken,
      },
      { requestPolicy: 'network-only' }
    )
    .toPromise();

  if (result.error || result.data?.tokenRefresh?.errors.length) {
    event.cookies.delete(REFRESH_TOKEN_KEY, cookieOpts);
    event.cookies.delete(CSRF_TOKEN_KEY, cookieOpts);

    redirect(HTTPStatusPermanentRedirect, AppRoute.AUTH_SIGNIN);
    return;
  }

  event.cookies.set(ACCESS_TOKEN_KEY, result.data?.tokenRefresh?.token as string, cookieOpts);
  event.cookies.set(REFRESH_TOKEN_KEY, refreshToken, cookieOpts);
  event.cookies.set(CSRF_TOKEN_KEY, csrfToken, cookieOpts);

  return json({
    user: result.data?.tokenRefresh?.user,
  });
};
