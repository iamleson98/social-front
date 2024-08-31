import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { DiscountPromotionrule } from "./DiscountPromotionrule";
import { DiscountVoucher } from "./DiscountVoucher";
import { OrderOrder } from "./OrderOrder";

@Index("discount_orderdiscount_created_at_8ee20efc", ["createdAt"], {})
@Index("discount_orderdiscount_token_e629a3e0_pk", ["id"], { unique: true })
@Index("discount_or_name_d16858_gin", ["name", "translatedName"], {})
@Index("discount_orderdiscount_old_id_key", ["oldId"], { unique: true })
@Index("discount_orderdiscount_order_token_id_2e6b263a", ["orderId"], {})
@Index("orderdiscount_promotion_rule_idx", ["promotionRuleId"], {})
@Index("orderdiscount_voucher_code_idx", ["voucherCode"], {})
@Index("discount_orderdiscount_voucher_id_10f0a1db", ["voucherId"], {})
@Entity("discount_orderdiscount", { schema: "public" })
export class DiscountOrderdiscount {
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

  @Column("uuid", { name: "order_id", nullable: true })
  orderId: string | null;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("integer", { name: "old_id", nullable: true, unique: true })
  oldId: number | null;

  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("integer", { name: "sale_id", nullable: true })
  saleId: number | null;

  @Column("integer", { name: "voucher_id", nullable: true })
  voucherId: number | null;

  @Column("uuid", { name: "promotion_rule_id", nullable: true })
  promotionRuleId: string | null;

  @Column("character varying", {
    name: "voucher_code",
    nullable: true,
    length: 255,
  })
  voucherCode: string | null;

  @ManyToOne(
    () => DiscountPromotionrule,
    (discountPromotionrule) => discountPromotionrule.discountOrderdiscounts
  )
  @JoinColumn([{ name: "promotion_rule_id", referencedColumnName: "id" }])
  promotionRule: DiscountPromotionrule;

  @ManyToOne(
    () => DiscountVoucher,
    (discountVoucher) => discountVoucher.discountOrderdiscounts
  )
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: DiscountVoucher;

  @ManyToOne(
    () => OrderOrder,
    (orderOrder) => orderOrder.discountOrderdiscounts
  )
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;
}
