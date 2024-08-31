import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { DiscountPromotionrule } from "./DiscountPromotionrule";
import { DiscountVoucher } from "./DiscountVoucher";
import { OrderOrderline } from "./OrderOrderline";

@Index("discount_orderlinediscount_created_at_acd29d5a", ["createdAt"], {})
@Index("discount_orderlinediscount_pkey", ["id"], { unique: true })
@Index("discount_orderlinediscount_line_id_045244c7", ["lineId"], {})
@Index("unique_orderline_discount_type", ["lineId", "uniqueType"], {
  unique: true,
})
@Index("orderlinedisc_promotion_rule_idx", ["promotionRuleId"], {})
@Index("orderlinedisc_voucher_code_idx", ["voucherCode"], {})
@Index("discount_orderlinediscount_voucher_id_07e8fb8a", ["voucherId"], {})
@Entity("discount_orderlinediscount", { schema: "public" })
export class DiscountOrderlinediscount {
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

  @Column("uuid", { name: "line_id", nullable: true, unique: true })
  lineId: string | null;

  @Column("uuid", { name: "promotion_rule_id", nullable: true })
  promotionRuleId: string | null;

  @Column("integer", { name: "sale_id", nullable: true })
  saleId: number | null;

  @Column("integer", { name: "voucher_id", nullable: true })
  voucherId: number | null;

  @Column("character varying", {
    name: "voucher_code",
    nullable: true,
    length: 255,
  })
  voucherCode: string | null;

  @Column("character varying", {
    name: "unique_type",
    nullable: true,
    unique: true,
    length: 64,
  })
  uniqueType: string | null;

  @ManyToOne(
    () => DiscountPromotionrule,
    (discountPromotionrule) => discountPromotionrule.discountOrderlinediscounts
  )
  @JoinColumn([{ name: "promotion_rule_id", referencedColumnName: "id" }])
  promotionRule: DiscountPromotionrule;

  @ManyToOne(
    () => DiscountVoucher,
    (discountVoucher) => discountVoucher.discountOrderlinediscounts
  )
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: DiscountVoucher;

  @ManyToOne(
    () => OrderOrderline,
    (orderOrderline) => orderOrderline.discountOrderlinediscounts
  )
  @JoinColumn([{ name: "line_id", referencedColumnName: "id" }])
  line: OrderOrderline;
}
