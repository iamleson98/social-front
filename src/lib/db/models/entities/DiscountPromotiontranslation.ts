import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DiscountPromotion } from "./DiscountPromotion";

@Index("discount_promotiontranslation_pkey", ["id"], { unique: true })
@Index(
  "discount_promotiontransl_language_code_promotion__a7ac2f7b_uniq",
  ["languageCode", "promotionId"],
  { unique: true }
)
@Index(
  "discount_promotiontranslation_promotion_id_bc72ea07",
  ["promotionId"],
  {}
)
@Entity("discount_promotiontranslation", { schema: "public" })
export class DiscountPromotiontranslation {
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

  @Column("uuid", { name: "promotion_id", unique: true })
  promotionId: string;

  @ManyToOne(
    () => DiscountPromotion,
    (discountPromotion) => discountPromotion.discountPromotiontranslations
  )
  @JoinColumn([{ name: "promotion_id", referencedColumnName: "id" }])
  promotion: DiscountPromotion;
}
