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

@Index("discount_promotionrule_variants_pkey", ["id"], { unique: true })
@Index(
  "discount_promotionrule_v_promotionrule_id_product_017c4f65_uniq",
  ["productvariantId", "promotionruleId"],
  { unique: true }
)
@Index(
  "discount_promotionrule_variants_productvariant_id_e715ba55",
  ["productvariantId"],
  {}
)
@Index(
  "discount_promotionrule_variants_promotionrule_id_d16c1004",
  ["promotionruleId"],
  {}
)
@Entity("discount_promotionrule_variants", { schema: "public" })
export class DiscountPromotionruleVariants {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("uuid", { name: "promotionrule_id", unique: true })
  promotionruleId: string;

  @Column("integer", { name: "productvariant_id", unique: true })
  productvariantId: number;

  @ManyToOne(
    () => ProductProductvariant,
    (productProductvariant) =>
      productProductvariant.discountPromotionruleVariants
  )
  @JoinColumn([{ name: "productvariant_id", referencedColumnName: "id" }])
  productvariant: ProductProductvariant;

  @ManyToOne(
    () => DiscountPromotionrule,
    (discountPromotionrule) =>
      discountPromotionrule.discountPromotionruleVariants
  )
  @JoinColumn([{ name: "promotionrule_id", referencedColumnName: "id" }])
  promotionrule: DiscountPromotionrule;
}
