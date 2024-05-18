import type { User } from "$lib/gql/graphql";
import { queryUserStore } from "$lib/stores/api";
import { accessTokenKey } from "$lib/stores/auth/store";
// import { accessTokenKey } from "$lib/stores/auth/store";
import { HTTPStatusSuccess, HTTPStatusTemporaryRedirect, type SocialResponse } from "$lib/utils/types";
import { redirect } from "@sveltejs/kit";
// import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { AppRoute } from "$lib/utils";


export const load: LayoutServerLoad<SocialResponse<User>> = async (event) => {
  // NOTE: we don't need to set Authorization header here.
  // Since server hook does that for us.

  const meQueryResult = await queryUserStore.fetch({ event });

  if (meQueryResult.errors?.length) {
    // meaning toen expired
    event.cookies.delete(accessTokenKey, { path: '/' });
    redirect(HTTPStatusTemporaryRedirect, AppRoute.AUTH_SIGNIN);
  }

  return {
    status: HTTPStatusSuccess,
    user: meQueryResult.data?.me as User,
  };
};

