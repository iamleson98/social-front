import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppApp } from "./AppApp";
import { GiftcardGiftcard } from "./GiftcardGiftcard";
import { AccountUser } from "./AccountUser";
import { OrderOrder } from "./OrderOrder";

@Index("giftcard_giftcardevent_app_id_9e107653", ["appId"], {})
@Index("giftcard_giftcardevent_gift_card_id_28f4a30a", ["giftCardId"], {})
@Index("giftcard_giftcardevent_pkey", ["id"], { unique: true })
@Index("giftcard_giftcardevent_order_id_a934cb10", ["orderId"], {})
@Index("giftcard_giftcardevent_user_id_6b906b4a", ["userId"], {})
@Entity("giftcard_giftcardevent", { schema: "public" })
export class GiftcardGiftcardevent {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "date" })
  date: Date;

  @Column("character varying", { name: "type", length: 255 })
  type: string;

  @Column("jsonb", { name: "parameters" })
  parameters: object;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("integer", { name: "gift_card_id" })
  giftCardId: number;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("uuid", { name: "order_id", nullable: true })
  orderId: string | null;

  @ManyToOne(() => AppApp, (appApp) => appApp.giftcardGiftcardevents)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(
    () => GiftcardGiftcard,
    (giftcardGiftcard) => giftcardGiftcard.giftcardGiftcardevents
  )
  @JoinColumn([{ name: "gift_card_id", referencedColumnName: "id" }])
  giftCard: GiftcardGiftcard;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.giftcardGiftcardevents
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;

  @ManyToOne(
    () => OrderOrder,
    (orderOrder) => orderOrder.giftcardGiftcardevents
  )
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;
}
