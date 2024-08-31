import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { AppApp } from "./AppApp";
import { DiscountPromotion } from "./DiscountPromotion";
import { AccountUser } from "./AccountUser";

@Index("discount_promotionevent_app_id_bf6964c4", ["appId"], {})
@Index("discount_promotionevent_date_37b2d832", ["date"], {})
@Index("discount_promotionevent_pkey", ["id"], { unique: true })
@Index("discount_promotionevent_promotion_id_df51584a", ["promotionId"], {})
@Index("discount_promotionevent_user_id_935d264f", ["userId"], {})
@Entity("discount_promotionevent", { schema: "public" })
export class DiscountPromotionevent {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("timestamp with time zone", { name: "date" })
  date: Date;

  @Column("character varying", { name: "type", length: 255 })
  type: string;

  @Column("jsonb", { name: "parameters" })
  parameters: object;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("uuid", { name: "promotion_id" })
  promotionId: string;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @ManyToOne(() => AppApp, (appApp) => appApp.discountPromotionevents)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(
    () => DiscountPromotion,
    (discountPromotion) => discountPromotion.discountPromotionevents
  )
  @JoinColumn([{ name: "promotion_id", referencedColumnName: "id" }])
  promotion: DiscountPromotion;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.discountPromotionevents
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;
}
