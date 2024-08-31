import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DiscountVoucher } from "./DiscountVoucher";

@Index("discount_vouchertranslation_pkey", ["id"], { unique: true })
@Index(
  "discount_vouchertranslat_language_code_voucher_id_af4428b5_uniq",
  ["languageCode", "voucherId"],
  { unique: true }
)
@Index("discount_vouchertranslation_voucher_id_288246a9", ["voucherId"], {})
@Entity("discount_vouchertranslation", { schema: "public" })
export class DiscountVouchertranslation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "language_code",
    unique: true,
    length: 35,
  })
  languageCode: string;

  @Column("character varying", { name: "name", nullable: true, length: 255 })
  name: string | null;

  @Column("integer", { name: "voucher_id", unique: true })
  voucherId: number;

  @ManyToOne(
    () => DiscountVoucher,
    (discountVoucher) => discountVoucher.discountVouchertranslations
  )
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: DiscountVoucher;
}
