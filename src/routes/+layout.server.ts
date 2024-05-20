import type { User } from "$lib/gql/graphql";
import { USER_ME_QUERY_STORE } from "$lib/stores/api";
import { ACCESS_TOKEN_KEY } from "$lib/stores/auth/store";
// import { ACCESS_TOKEN_KEY } from "$lib/stores/auth/store";
import { HTTPStatusSuccess, HTTPStatusTemporaryRedirect, type SocialResponse } from "$lib/utils/types";
import { redirect } from "@sveltejs/kit";
// import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { AppRoute } from "$lib/utils";


export const load: LayoutServerLoad<SocialResponse<User>> = async (event) => {
  const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
  if (accessToken) {
    const meQueryResult = await USER_ME_QUERY_STORE.fetch({ event });

    if (meQueryResult.errors?.length) {
      // meaning token has expired
      event.cookies.delete(ACCESS_TOKEN_KEY, { path: '/' });
      redirect(HTTPStatusTemporaryRedirect, AppRoute.AUTH_SIGNIN);
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

