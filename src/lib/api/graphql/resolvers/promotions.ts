import { type Mutation, type MutationTokenCreateArgs, type PromotionCountableConnection, type Query, type QueryPromotionsArgs } from "$lib/gql/graphql";
import { type YogaInitialContext } from "graphql-yoga";
import { GRAPHQL_CLIENT } from "$lib/api/client";
import { USER_LOGIN_MUTATION_STORE } from "$lib/api/auth";
import { PROMOTION_MANAGER_EMAIL, PROMOTION_MANAGER_PWD } from "$env/static/private";
import { PROMOTIONS_QUERY } from "$lib/api/discount";

let token: string

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const resolvePromotions = async function (root: unknown, args: QueryPromotionsArgs, context: YogaInitialContext): Promise<PromotionCountableConnection> {
  if (!token) {
    const signinResult = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'tokenCreate'>, MutationTokenCreateArgs>(
      USER_LOGIN_MUTATION_STORE,
      {
        email: PROMOTION_MANAGER_EMAIL,
        password: PROMOTION_MANAGER_PWD,
      },
    )
    if (signinResult.error || !signinResult.data?.tokenCreate?.token)
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

    token = signinResult.data?.tokenCreate.token;
  }

  const result = await GRAPHQL_CLIENT.query<Pick<Query, 'promotions'>, QueryPromotionsArgs>(
    PROMOTIONS_QUERY,
    args,
    {
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  )
  if (result.error)
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

  return result.data?.promotions as PromotionCountableConnection;
};
