import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { DiscountPromotionrule } from "./DiscountPromotionrule";
import { DiscountVoucher } from "./DiscountVoucher";
import { CheckoutCheckout } from "./CheckoutCheckout";

@Index(
  "discount_checkoutdiscoun_checkout_id_promotion_ru_d2e697fb_uniq",
  ["checkoutId", "promotionRuleId"],
  { unique: true }
)
@Index("discount_checkoutdiscount_checkout_id_e5063abc", ["checkoutId"], {})
@Index("discount_checkoutdiscount_created_at_c8166ad7", ["createdAt"], {})
@Index("discount_checkoutdiscount_pkey", ["id"], { unique: true })
@Index("discount_ch_name_64e096_gin", ["name", "translatedName"], {})
@Index("checkoutdiscount_rule_idx", ["promotionRuleId"], {})
@Index("checkoutdiscount_voucher_idx", ["voucherCode"], {})
@Index("discount_checkoutdiscount_voucher_id_1ef32adb", ["voucherId"], {})
@Entity("discount_checkoutdiscount", { schema: "public" })
export class DiscountCheckoutdiscount {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("character varying", { name: "type", length: 64 })
  type: string;

  @Column("character varying", { name: "value_type", length: 10 })
  valueType: string;

  @Column("numeric", { name: "value", precision: 12, scale: 3 })
  value: string;

  @Column("numeric", { name: "amount_value", precision: 12, scale: 3 })
  amountValue: string;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("character varying", { name: "name", nullable: true, length: 255 })
  name: string | null;

  @Column("character varying", {
    name: "translated_name",
    nullable: true,
    length: 255,
  })
  translatedName: string | null;

  @Column("text", { name: "reason", nullable: true })
  reason: string | null;

  @Column("character varying", {
    name: "voucher_code",
    nullable: true,
    length: 255,
  })
  voucherCode: string | null;

  @Column("uuid", { name: "checkout_id", nullable: true, unique: true })
  checkoutId: string | null;

  @Column("uuid", { name: "promotion_rule_id", nullable: true, unique: true })
  promotionRuleId: string | null;

  @Column("integer", { name: "voucher_id", nullable: true })
  voucherId: number | null;

  @ManyToOne(
    () => DiscountPromotionrule,
    (discountPromotionrule) => discountPromotionrule.discountCheckoutdiscounts
  )
  @JoinColumn([{ name: "promotion_rule_id", referencedColumnName: "id" }])
  promotionRule: DiscountPromotionrule;

  @ManyToOne(
    () => DiscountVoucher,
    (discountVoucher) => discountVoucher.discountCheckoutdiscounts
  )
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: DiscountVoucher;

  @ManyToOne(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.discountCheckoutdiscounts
  )
  @JoinColumn([{ name: "checkout_id", referencedColumnName: "token" }])
  checkout: CheckoutCheckout;
}
