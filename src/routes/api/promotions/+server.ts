import { PROMOTION_MANAGER_EMAIL, PROMOTION_MANAGER_PWD } from '$env/static/private';
import { USER_LOGIN_MUTATION_STORE } from '$lib/api';
import { GRAPHQL_CLIENT } from '$lib/api/client';
import { PROMOTIONS_QUERY } from '$lib/api/discount';
import type { Mutation, MutationTokenCreateArgs, PromotionCountableConnection, Query, QueryPromotionsArgs } from '$lib/gql/graphql';
import { json } from '@sveltejs/kit';

let token: string;

export const POST = async (event) => {
  const body: QueryPromotionsArgs = await event.request.json();

  if (!token) {
    const signinResult = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'tokenCreate'>, MutationTokenCreateArgs>(
      USER_LOGIN_MUTATION_STORE,
      {
        email: PROMOTION_MANAGER_EMAIL,
        password: PROMOTION_MANAGER_PWD,
      },
    )
    if (signinResult.error || !signinResult.data?.tokenCreate?.token)
      return json({
        promotions: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
        } satisfies PromotionCountableConnection,
      });

    token = signinResult.data?.tokenCreate.token;
  }

  const result = await GRAPHQL_CLIENT.query<Pick<Query, 'promotions'>, QueryPromotionsArgs>(
    PROMOTIONS_QUERY,
    body,
    {
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  )
  if (result.error)
    return json({
      promotions: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      } satisfies PromotionCountableConnection,
    });

  return json({
    promotions: result.data?.promotions
  });
};
