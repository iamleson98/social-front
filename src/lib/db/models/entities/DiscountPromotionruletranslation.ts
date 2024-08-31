import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DiscountPromotionrule } from "./DiscountPromotionrule";

@Index("discount_promotionruletranslation_pkey", ["id"], { unique: true })
@Index(
  "discount_promotionruletr_language_code_promotion__1b8b92f9_uniq",
  ["languageCode", "promotionRuleId"],
  { unique: true }
)
@Index(
  "discount_promotionruletranslation_promotion_rule_id_e2ab38d7",
  ["promotionRuleId"],
  {}
)
@Entity("discount_promotionruletranslation", { schema: "public" })
export class DiscountPromotionruletranslation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "language_code",
    unique: true,
    length: 35,
  })
  languageCode: string;

  @Column("character varying", { name: "name", nullable: true, length: 255 })
  name: string | null;

  @Column("jsonb", { name: "description", nullable: true })
  description: object | null;

  @Column("uuid", { name: "promotion_rule_id", unique: true })
  promotionRuleId: string;

  @ManyToOne(
    () => DiscountPromotionrule,
    (discountPromotionrule) =>
      discountPromotionrule.discountPromotionruletranslations
  )
  @JoinColumn([{ name: "promotion_rule_id", referencedColumnName: "id" }])
  promotionRule: DiscountPromotionrule;
}
