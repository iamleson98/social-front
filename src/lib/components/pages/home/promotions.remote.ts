import { query } from "$app/server";
import { GRAPHQL_CLIENT, isAuthenError } from "$lib/api/client";
import { PROMOTIONS_QUERY } from "$lib/api/discount";
import { OrderDirection, PromotionSortField, type PromotionCountableConnection, type PromotionCountableEdge, type Query, type QueryPromotionsArgs } from "$lib/gql/graphql";
import { getMiddleAccountAccessToken, tryRefreshToken } from "$lib/utils/server-side-only";
import { json } from "@sveltejs/kit";
import { number, object, string, enum as enum_, array } from "zod";

const PromotionsQuerySchema = object({
  after: string().optional(),
  before: string().optional(),
  first: number().optional(),
  last: number().optional(),
  sortBy: object({
    field: enum_(Object.values(PromotionSortField)),
    direction: enum_(Object.values(OrderDirection)),
  }).optional(),
  where: object({
    ids: array(string().nonempty()).optional(),
    name: object({
      eq: string().optional(),
      oneOf: array(string()).optional()
    }).optional(),
  }).optional()
});

const ErrorValue = {
  edges: [] as PromotionCountableEdge[],
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
  },
} satisfies PromotionCountableConnection

export const getPromotions = query(PromotionsQuerySchema, async (args) => {
  let token = await getMiddleAccountAccessToken();

  if (token == null) return ErrorValue as PromotionCountableConnection;

  for (let tr = 0; tr < 3; tr++) {
    const result = await GRAPHQL_CLIENT.query<Pick<Query, 'promotions'>, QueryPromotionsArgs>(
      PROMOTIONS_QUERY,
      args,
      {
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        requestPolicy: 'network-only',
      },
    );

    if (result.error || !result.data?.promotions) {
      if (result.error && isAuthenError(result.error)) {
        token = await tryRefreshToken();
        continue;
      } else return ErrorValue as PromotionCountableConnection;
    }

    return result.data.promotions;
  }

  return ErrorValue as PromotionCountableConnection;
});
