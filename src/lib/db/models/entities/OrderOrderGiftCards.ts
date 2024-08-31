import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GiftcardGiftcard } from "./GiftcardGiftcard";
import { OrderOrder } from "./OrderOrder";

@Index("order_order_gift_cards_giftcard_id_f6844926", ["giftcardId"], {})
@Index("order_order_gift_cards_pkey", ["id"], { unique: true })
@Entity("order_order_gift_cards", { schema: "public" })
export class OrderOrderGiftCards {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "giftcard_id" })
  giftcardId: number;

  @ManyToOne(
    () => GiftcardGiftcard,
    (giftcardGiftcard) => giftcardGiftcard.orderOrderGiftCards
  )
  @JoinColumn([{ name: "giftcard_id", referencedColumnName: "id" }])
  giftcard: GiftcardGiftcard;

  @ManyToOne(() => OrderOrder, (orderOrder) => orderOrder.orderOrderGiftCards)
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;
}
