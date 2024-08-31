import { dbManager } from "$lib/db";
import { DiscountPromotion } from "$lib/db/models/entities/DiscountPromotion";
import { OrderDirection, PromotionSortField, type PromotionCountableConnection, type QueryPromotionsArgs } from "$lib/gql/graphql";
import { type YogaInitialContext } from "graphql-yoga";
import { addPaginOptionsToQuery, createGraphqlPageInfo, dateToRFC3339, encodeBase64Cursor, getLimit, objectToMetaItemList } from "../utils";
import type { PaginationOptions } from "$lib/utils/utils";


export const resolvePromotions = async function (root: unknown, { first, last, sortBy, before, after }: QueryPromotionsArgs, context: YogaInitialContext): Promise<PromotionCountableConnection> {
  const db = await dbManager.getDatabaseConnection();
  let queryBuilder = db.getRepository(DiscountPromotion).createQueryBuilder();

  if (!sortBy) {
    sortBy = {
      field: PromotionSortField.CreatedAt,
      direction: OrderDirection.Asc, // dummy value
    };
  }

  const paginOpts: PaginationOptions = {
    first,
    last,
    before,
    after,
  };

  const totalCount = await queryBuilder.getCount();

  queryBuilder = addPaginOptionsToQuery(queryBuilder, sortBy.field.toString().toLowerCase(), paginOpts);

  let promotions = await queryBuilder.getMany();
  let predicate: (p: DiscountPromotion) => unknown;
  switch (sortBy.field) {
    case PromotionSortField.CreatedAt:
      predicate = pm => dateToRFC3339(pm.createdAt);
      break;
    case PromotionSortField.StartDate:
      predicate = pm => dateToRFC3339(pm.startDate);
      break;
    case PromotionSortField.EndDate:
      predicate = pm => pm.endDate ? dateToRFC3339(pm.endDate) : pm.name;
      break;
    default:
      predicate = pm => pm.name;
  }


  const pageInfo = createGraphqlPageInfo(paginOpts, promotions);

  const queryLimit = getLimit(paginOpts);
  if (queryLimit) {
    promotions = promotions.slice(0, queryLimit - 1);
  }

  pageInfo.startCursor = promotions.length > 0 ? encodeBase64Cursor(DiscountPromotion.name, predicate(promotions[0])) : null;
  pageInfo.endCursor = promotions.length > 0 ? encodeBase64Cursor(DiscountPromotion.name, predicate(promotions[promotions.length - 1])) : null;

  const result: PromotionCountableConnection = {
    totalCount,
    pageInfo,
    edges: promotions.map(promotion => {
      return {
        cursor: encodeBase64Cursor(DiscountPromotion.name, predicate(promotion)),
        node: {
          id: promotion.id,
          name: promotion.name,
          metadata: objectToMetaItemList(promotion.metadata as Record<string, unknown>),
          privateMetadata: objectToMetaItemList(promotion.privateMetadata as Record<string, unknown>),
          createdAt: promotion.createdAt,
          startDate: promotion.startDate,
          updatedAt: promotion.updatedAt,
        },
      }
    })
  };

  return result;
};
