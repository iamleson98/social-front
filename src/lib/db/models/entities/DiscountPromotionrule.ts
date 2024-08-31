import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { DiscountCheckoutdiscount } from "./DiscountCheckoutdiscount";
import { DiscountCheckoutlinediscount } from "./DiscountCheckoutlinediscount";
import { DiscountOrderdiscount } from "./DiscountOrderdiscount";
import { DiscountOrderlinediscount } from "./DiscountOrderlinediscount";
import { DiscountPromotion } from "./DiscountPromotion";
import { DiscountPromotionruleChannels } from "./DiscountPromotionruleChannels";
import { DiscountPromotionruleGifts } from "./DiscountPromotionruleGifts";
import { DiscountPromotionruleVariants } from "./DiscountPromotionruleVariants";
import { DiscountPromotionruletranslation } from "./DiscountPromotionruletranslation";
import { ProductVariantchannellistingpromotionrule } from "./ProductVariantchannellistingpromotionrule";

@Index("discount_promotionrule_pkey", ["id"], { unique: true })
@Index(
  "discount_promotionrule_old_channel_listing_id_key",
  ["oldChannelListingId"],
  { unique: true }
)
@Index("discount_promotionrule_promotion_id_6deaa086", ["promotionId"], {})
@Entity("discount_promotionrule", { schema: "public" })
export class DiscountPromotionrule {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "name", nullable: true, length: 255 })
  name: string | null;

  @Column("jsonb", { name: "description", nullable: true })
  description: object | null;

  @Column("jsonb", { name: "catalogue_predicate" })
  cataloguePredicate: object;

  @Column("character varying", {
    name: "reward_value_type",
    nullable: true,
    length: 255,
  })
  rewardValueType: string | null;

  @Column("numeric", {
    name: "reward_value",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  rewardValue: string | null;

  @Column("uuid", { name: "promotion_id" })
  promotionId: string;

  @Column("integer", {
    name: "old_channel_listing_id",
    nullable: true,
    unique: true,
  })
  oldChannelListingId: number | null;

  @Column("jsonb", { name: "order_predicate", default: {} })
  orderPredicate: object;

  @Column("character varying", {
    name: "reward_type",
    nullable: true,
    length: 255,
  })
  rewardType: string | null;

  @Column("boolean", {
    name: "variants_dirty",
    nullable: true,
    default: () => "false",
  })
  variantsDirty: boolean | null;

  @OneToMany(
    () => DiscountCheckoutdiscount,
    (discountCheckoutdiscount) => discountCheckoutdiscount.promotionRule
  )
  discountCheckoutdiscounts: DiscountCheckoutdiscount[];

  @OneToMany(
    () => DiscountCheckoutlinediscount,
    (discountCheckoutlinediscount) => discountCheckoutlinediscount.promotionRule
  )
  discountCheckoutlinediscounts: DiscountCheckoutlinediscount[];

  @OneToMany(
    () => DiscountOrderdiscount,
    (discountOrderdiscount) => discountOrderdiscount.promotionRule
  )
  discountOrderdiscounts: DiscountOrderdiscount[];

  @OneToMany(
    () => DiscountOrderlinediscount,
    (discountOrderlinediscount) => discountOrderlinediscount.promotionRule
  )
  discountOrderlinediscounts: DiscountOrderlinediscount[];

  @ManyToOne(
    () => DiscountPromotion,
    (discountPromotion) => discountPromotion.discountPromotionrules
  )
  @JoinColumn([{ name: "promotion_id", referencedColumnName: "id" }])
  promotion: DiscountPromotion;

  @OneToMany(
    () => DiscountPromotionruleChannels,
    (discountPromotionruleChannels) =>
      discountPromotionruleChannels.promotionrule
  )
  discountPromotionruleChannels: DiscountPromotionruleChannels[];

  @OneToMany(
    () => DiscountPromotionruleGifts,
    (discountPromotionruleGifts) => discountPromotionruleGifts.promotionrule
  )
  discountPromotionruleGifts: DiscountPromotionruleGifts[];

  @OneToMany(
    () => DiscountPromotionruleVariants,
    (discountPromotionruleVariants) =>
      discountPromotionruleVariants.promotionrule
  )
  discountPromotionruleVariants: DiscountPromotionruleVariants[];

  @OneToMany(
    () => DiscountPromotionruletranslation,
    (discountPromotionruletranslation) =>
      discountPromotionruletranslation.promotionRule
  )
  discountPromotionruletranslations: DiscountPromotionruletranslation[];

  @OneToMany(
    () => ProductVariantchannellistingpromotionrule,
    (productVariantchannellistingpromotionrule) =>
      productVariantchannellistingpromotionrule.promotionRule
  )
  productVariantchannellistingpromotionrules: ProductVariantchannellistingpromotionrule[];
}
