import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { DiscountVoucher } from "./DiscountVoucher";
import { DiscountVouchercustomer } from "./DiscountVouchercustomer";

@Index("discount_vouchercode_code_8ba04be7_like", ["code"], {})
@Index("discount_vouchercode_code_key", ["code"], { unique: true })
@Index("discount_vouchercode_pkey", ["id"], { unique: true })
@Index("vouchercode_voucher_idx", ["voucherId"], {})
@Entity("discount_vouchercode", { schema: "public" })
export class DiscountVouchercode {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "code", unique: true, length: 255 })
  code: string;

  @Column("integer", { name: "used" })
  used: number;

  @Column("boolean", { name: "is_active", default: () => "true" })
  isActive: boolean;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("integer", { name: "voucher_id" })
  voucherId: number;

  @ManyToOne(
    () => DiscountVoucher,
    (discountVoucher) => discountVoucher.discountVouchercodes
  )
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: DiscountVoucher;

  @OneToMany(
    () => DiscountVouchercustomer,
    (discountVouchercustomer) => discountVouchercustomer.voucherCode
  )
  discountVouchercustomers: DiscountVouchercustomer[];
}
