import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DiscountVouchercode } from "./DiscountVouchercode";

@Index(
  "discount_vouchercustomer_voucher_code_id_customer_4411499e_uniq",
  ["customerEmail", "voucherCodeId"],
  { unique: true }
)
@Index("discount_vouchercustomer_pkey", ["id"], { unique: true })
@Index("vouchercustomer_voucher_code_idx", ["voucherCodeId"], {})
@Entity("discount_vouchercustomer", { schema: "public" })
export class DiscountVouchercustomer {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "customer_email",
    unique: true,
    length: 254,
  })
  customerEmail: string;

  @Column("uuid", { name: "voucher_code_id", unique: true })
  voucherCodeId: string;

  @ManyToOne(
    () => DiscountVouchercode,
    (discountVouchercode) => discountVouchercode.discountVouchercustomers
  )
  @JoinColumn([{ name: "voucher_code_id", referencedColumnName: "id" }])
  voucherCode: DiscountVouchercode;
}
