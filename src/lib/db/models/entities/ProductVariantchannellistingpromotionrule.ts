import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DiscountPromotionrule } from "./DiscountPromotionrule";
import { ProductProductvariantchannellisting } from "./ProductProductvariantchannellisting";

@Index("product_variantchannellistingpromotionrule_pkey", ["id"], {
  unique: true,
})
@Index(
  "product_variantchannelli_variant_channel_listing__8f7a36d8_uniq",
  ["promotionRuleId", "variantChannelListingId"],
  { unique: true }
)
@Index(
  "product_variantchannellist_promotion_rule_id_af12d96f",
  ["promotionRuleId"],
  {}
)
@Index(
  "product_variantchannellist_variant_channel_listing_id_3d6a575a",
  ["variantChannelListingId"],
  {}
)
@Entity("product_variantchannellistingpromotionrule", { schema: "public" })
export class ProductVariantchannellistingpromotionrule {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("numeric", { name: "discount_amount", precision: 12, scale: 3 })
  discountAmount: string;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("uuid", { name: "promotion_rule_id", unique: true })
  promotionRuleId: string;

  @Column("integer", { name: "variant_channel_listing_id", unique: true })
  variantChannelListingId: number;

  @ManyToOne(
    () => DiscountPromotionrule,
    (discountPromotionrule) =>
      discountPromotionrule.productVariantchannellistingpromotionrules
  )
  @JoinColumn([{ name: "promotion_rule_id", referencedColumnName: "id" }])
  promotionRule: DiscountPromotionrule;

  @ManyToOne(
    () => ProductProductvariantchannellisting,
    (productProductvariantchannellisting) =>
      productProductvariantchannellisting.productVariantchannellistingpromotionrules
  )
  @JoinColumn([
    { name: "variant_channel_listing_id", referencedColumnName: "id" },
  ])
  variantChannelListing: ProductProductvariantchannellisting;
}
