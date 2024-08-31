import { Column, Entity, Index, OneToMany } from "typeorm";
import { DiscountPromotionevent } from "./DiscountPromotionevent";
import { DiscountPromotionrule } from "./DiscountPromotionrule";
import { DiscountPromotiontranslation } from "./DiscountPromotiontranslation";

@Index("discount_promotion_created_at_8775e81a", ["createdAt"], {})
@Index("end_date_idx", ["endDate"], {})
@Index("discount_promotion_pkey", ["id"], { unique: true })
@Index("discount_promotion_old_sale_id_key", ["oldSaleId"], { unique: true })
@Index("start_date_idx", ["startDate"], {})
@Index("discount_promotion_updated_at_680bf304", ["updatedAt"], {})
@Entity("discount_promotion", { schema: "public" })
export class DiscountPromotion {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("jsonb", { name: "description", nullable: true })
  description: object | null;

  @Column("integer", { name: "old_sale_id", nullable: true, unique: true })
  oldSaleId: number | null;

  @Column("timestamp with time zone", { name: "start_date" })
  startDate: Date;

  @Column("timestamp with time zone", { name: "end_date", nullable: true })
  endDate: Date | null;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("timestamp with time zone", {
    name: "last_notification_scheduled_at",
    nullable: true,
  })
  lastNotificationScheduledAt: Date | null;

  @Column("character varying", {
    name: "type",
    length: 255,
    default: () => "'catalogue'",
  })
  type: string;

  @OneToMany(
    () => DiscountPromotionevent,
    (discountPromotionevent) => discountPromotionevent.promotion
  )
  discountPromotionevents: DiscountPromotionevent[];

  @OneToMany(
    () => DiscountPromotionrule,
    (discountPromotionrule) => discountPromotionrule.promotion
  )
  discountPromotionrules: DiscountPromotionrule[];

  @OneToMany(
    () => DiscountPromotiontranslation,
    (discountPromotiontranslation) => discountPromotiontranslation.promotion
  )
  discountPromotiontranslations: DiscountPromotiontranslation[];
}
