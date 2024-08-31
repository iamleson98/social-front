import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GiftcardGiftcard } from "./GiftcardGiftcard";
import { CheckoutCheckout } from "./CheckoutCheckout";

@Index(
  "checkout_checkout_gift_c_checkout_id_giftcard_id_401ba79e_uniq",
  ["checkoutId", "giftcardId"],
  { unique: true }
)
@Index("checkout_checkout_gift_cards_checkout_id_e314728d", ["checkoutId"], {})
@Index("checkout_checkout_gift_cards_giftcard_id_f5994462", ["giftcardId"], {})
@Index("checkout_checkout_gift_cards_pkey", ["id"], { unique: true })
@Entity("checkout_checkout_gift_cards", { schema: "public" })
export class CheckoutCheckoutGiftCards {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "checkout_id", unique: true })
  checkoutId: string;

  @Column("integer", { name: "giftcard_id", unique: true })
  giftcardId: number;

  @ManyToOne(
    () => GiftcardGiftcard,
    (giftcardGiftcard) => giftcardGiftcard.checkoutCheckoutGiftCards
  )
  @JoinColumn([{ name: "giftcard_id", referencedColumnName: "id" }])
  giftcard: GiftcardGiftcard;

  @ManyToOne(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.checkoutCheckoutGiftCards
  )
  @JoinColumn([{ name: "checkout_id", referencedColumnName: "token" }])
  checkout: CheckoutCheckout;
}
