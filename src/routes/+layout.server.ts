import type { Mutation, Query, User } from "$lib/gql/graphql";
import { USER_ME_QUERY_STORE } from "$lib/stores/api";
import { ACCESS_TOKEN_KEY, CSRF_TOKEN_KEY, REFRESH_TOKEN_KEY } from "$lib/stores/auth/store";
import { HTTPStatusSuccess, type SocialResponse } from "$lib/utils/types";
import type { LayoutServerLoad } from "./$types";
import { USER_REFRESH_TOKEN_MUTATION_STORE } from "$lib/stores/api/auth";
import { graphqlClient } from "$lib/client";


export const load: LayoutServerLoad<SocialResponse<User>> = async (event) => {
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
  if (!accessToken) {
    return {
      status: HTTPStatusSuccess,
    };
  }

  const meQueryResult = await graphqlClient.backendQuery<Pick<Query, 'me'>>(USER_ME_QUERY_STORE, {}, event);
  if (meQueryResult.error) {
    // means token has expired
    event.cookies.delete(ACCESS_TOKEN_KEY, { path: '/' });

    // try to refresh new token
    const refreshToken = event.cookies.get(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return {
        status: HTTPStatusSuccess,
      };
    }

    const variables: Record<string, string> = { refreshToken };
    const csrfToken = event.cookies.get(CSRF_TOKEN_KEY);
    if (csrfToken) {
      variables.csrfToken = csrfToken;
    }

    const tokenRefreshResult = await graphqlClient.backendMutation<Pick<Mutation, 'tokenRefresh'>>(USER_REFRESH_TOKEN_MUTATION_STORE, variables, event);
    if (tokenRefreshResult.error || tokenRefreshResult.data?.tokenRefresh?.errors.length) {
      // meaning refresh token expires or server error
      event.cookies.delete(REFRESH_TOKEN_KEY, { path: '/' });
      event.cookies.delete(CSRF_TOKEN_KEY, { path: '/' });
      return {
        status: HTTPStatusSuccess,
      };
    }

    const cookieOpts = {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60,
    }
    event.cookies.set(ACCESS_TOKEN_KEY, tokenRefreshResult.data?.tokenRefresh?.token as string, cookieOpts);
    return {
      status: HTTPStatusSuccess,
    };
  }

  return {
    status: HTTPStatusSuccess,
    user: meQueryResult.data?.me,
  };
}
