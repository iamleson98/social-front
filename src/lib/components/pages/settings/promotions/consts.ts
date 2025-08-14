import { RewardTypeEnum, type CataloguePredicateInput, type PromotionRuleCreateInput, type PromotionRuleUpdateInput } from "$lib/gql/graphql";

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
