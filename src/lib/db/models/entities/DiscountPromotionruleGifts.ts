import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProductvariant } from "./ProductProductvariant";
import { DiscountPromotionrule } from "./DiscountPromotionrule";

@Index("discount_promotionrule_gifts_pkey", ["id"], { unique: true })
@Index(
  "discount_promotionrule_gifts_productvariant_id_5409d0a9",
  ["productvariantId"],
  {}
)
@Index(
  "discount_promotionrule_g_promotionrule_id_product_d7f5da3b_uniq",
  ["productvariantId", "promotionruleId"],
  { unique: true }
)
@Index(
  "discount_promotionrule_gifts_promotionrule_id_d56c403e",
  ["promotionruleId"],
  {}
)
@Entity("discount_promotionrule_gifts", { schema: "public" })
export class DiscountPromotionruleGifts {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "promotionrule_id", unique: true })
  promotionruleId: string;

  @Column("integer", { name: "productvariant_id", unique: true })
  productvariantId: number;

  @ManyToOne(
    () => ProductProductvariant,
    (productProductvariant) => productProductvariant.discountPromotionruleGifts
  )
  @JoinColumn([{ name: "productvariant_id", referencedColumnName: "id" }])
  productvariant: ProductProductvariant;

  @ManyToOne(
    () => DiscountPromotionrule,
    (discountPromotionrule) => discountPromotionrule.discountPromotionruleGifts
  )
  @JoinColumn([{ name: "promotionrule_id", referencedColumnName: "id" }])
  promotionrule: DiscountPromotionrule;
}
