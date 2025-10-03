import { PROMOTION_MANAGER_EMAIL, PROMOTION_MANAGER_PWD } from "$env/static/private";
import { USER_LOGIN_MUTATION_STORE } from "$lib/api";
import { GRAPHQL_CLIENT } from "$lib/api/client";
import type { Mutation, MutationTokenCreateArgs } from "$lib/gql/graphql";


let token: string | null = null;

export const getmiddleAccountAccessToken = async () => {
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
  }

  return token;
}
