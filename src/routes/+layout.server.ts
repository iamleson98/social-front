import type { User } from "$lib/gql/graphql";
import { USER_ME_QUERY_STORE } from "$lib/stores/api";
import { ACCESS_TOKEN_KEY, CSRF_TOKEN_KEY, REFRESH_TOKEN_KEY } from "$lib/stores/auth/store";
import { HTTPStatusSuccess, type SocialResponse } from "$lib/utils/types";
import type { LayoutServerLoad } from "./$types";
import { USER_REFRESH_TOKEN_MUTATION_STORE } from "$lib/stores/api/auth";


export const load: LayoutServerLoad<SocialResponse<User>> = async (event) => {
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
  if (accessToken) {
    const meQueryResult = await USER_ME_QUERY_STORE.fetch({ event });

    if (meQueryResult.errors?.length) {
      // meaning token has expired
      event.cookies.delete(ACCESS_TOKEN_KEY, { path: '/' });
      // try to refresh new token
      const refreshToken = event.cookies.get(REFRESH_TOKEN_KEY);
      const csrfToken = event.cookies.get(CSRF_TOKEN_KEY);

      if (refreshToken) {
        const variables: Record<string, string> = { refreshToken };
        if (csrfToken) {
          variables.csrfToken = csrfToken;
        }

        const tokenRefreshResult = await USER_REFRESH_TOKEN_MUTATION_STORE.mutate(variables, { event });
        if (tokenRefreshResult.errors?.length) {
          // meaning refresh token expires or server error
          event.cookies.delete(REFRESH_TOKEN_KEY, { path: '/' });
          event.cookies.delete(CSRF_TOKEN_KEY, { path: '/' });
        } else {
          const cookieOpts = {
            path: '/',
            secure: true,
            httpOnly: true,
            maxAge: 24 * 60 * 60,
          }
          event.cookies.set(ACCESS_TOKEN_KEY, tokenRefreshResult.data?.tokenRefresh?.token as string, cookieOpts);
        }

        return {
          status: HTTPStatusSuccess,
        };
      }

      return {
        status: HTTPStatusSuccess,
      };
    }

    return {
      status: HTTPStatusSuccess,
      user: meQueryResult.data?.me as User,
    };
  }

  return {
    status: HTTPStatusSuccess,
  };
};

