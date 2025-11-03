import { PROMOTION_MANAGER_EMAIL, PROMOTION_MANAGER_PWD } from "$env/static/private";
import { USER_LOGIN_MUTATION_STORE, USER_REFRESH_TOKEN_MUTATION_STORE } from "$lib/api";
import { GRAPHQL_CLIENT } from "$lib/api/client";
import type { Mutation, MutationTokenCreateArgs, MutationTokenRefreshArgs } from "$lib/gql/graphql";


let token: string | null = null;
let refreshToken: string | null | undefined = null;
let csrfToken: string | null | undefined = null;

export const getMiddleAccountAccessToken = async () => {
  if (!token) {
    const signinResult = await GRAPHQL_CLIENT.mutation<
      Pick<Mutation, 'tokenCreate'>,
      MutationTokenCreateArgs
    >(USER_LOGIN_MUTATION_STORE, {
      email: PROMOTION_MANAGER_EMAIL,
      password: PROMOTION_MANAGER_PWD,
    });
    if (signinResult.error || !signinResult.data?.tokenCreate?.token)
      return null;

    token = signinResult.data?.tokenCreate.token;
    refreshToken = signinResult.data?.tokenCreate.refreshToken;
    csrfToken = signinResult.data?.tokenCreate.csrfToken;
  }

  return token;
}

export const tryRefreshToken = async () => {
  if (!refreshToken || !csrfToken) {
    token = null;
    return await getMiddleAccountAccessToken();
  }

  const refreshResult = await GRAPHQL_CLIENT.mutation<
    Pick<Mutation, 'tokenRefresh'>,
    MutationTokenRefreshArgs
  >(USER_REFRESH_TOKEN_MUTATION_STORE, {
    refreshToken,
    csrfToken
  });

  if (refreshResult.error || !refreshResult.data?.tokenRefresh?.token)
    return null;

  token = refreshResult.data?.tokenRefresh.token;

  return token;
};

