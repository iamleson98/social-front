import { RewardTypeEnum, type CataloguePredicateInput, type PromotionRule, type PromotionRuleCreateInput, type PromotionRuleUpdateInput } from "$lib/gql/graphql";

export const DefaultPromotionRuleUpdateinput: PromotionRuleUpdateInput = {
  name: '',
  addChannels: [],
  removeChannels: [],
  rewardValue: 0,
  rewardType: RewardTypeEnum.SubtotalDiscount,
};

export const DefaultPromotionRuleCreateInput: PromotionRuleCreateInput = {
  name: '',
  channels: [],
  promotion: "",
  rewardValue: 0,
  rewardType: RewardTypeEnum.SubtotalDiscount,
};

export const DefaultCatalogPredicate: CataloguePredicateInput = {
  productPredicate: { ids: [] },
  variantPredicate: { ids: [] },
  categoryPredicate: { ids: [] },
  collectionPredicate: { ids: [] },
};

export type TabKey = 'products' | 'variants' | 'categories' | 'collections';

/**
 * sometimes the backend return predicates ids as empty object {}, which is not desired.
 * This function converts them to array [] instead.
 */
export const cleanRulesData = (rules: PromotionRule[]): PromotionRule[] => {
  return rules.map(rule => {
    const predicates = rule.cataloguePredicate || {};

    let productIds = predicates.productPredicate?.ids;
    if (!productIds || !Array.isArray(productIds))
      productIds = [];

    let variantIds = predicates.variantPredicate?.ids;
    if (!variantIds || !Array.isArray(variantIds))
      variantIds = [];

    let collectionIds = predicates.collectionPredicate?.ids;
    if (!collectionIds || !Array.isArray(collectionIds))
      collectionIds = [];

    let categoryIds = predicates.categoryPredicate?.ids;
    if (!categoryIds || !Array.isArray(categoryIds))
      categoryIds = [];

    return {
      ...rule,
      cataloguePredicate: {
        productPredicate: { ids: productIds },
        variantPredicate: { ids: variantIds },
        categoryPredicate: { ids: categoryIds },
        collectionPredicate: { ids: collectionIds },
      },
    };
  });
};
