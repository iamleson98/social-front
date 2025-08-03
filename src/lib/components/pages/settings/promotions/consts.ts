import { RewardTypeEnum, type PromotionRuleCreateInput, type PromotionRuleUpdateInput } from "$lib/gql/graphql";

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
  
