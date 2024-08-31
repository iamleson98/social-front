import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProductvariant } from "./ProductProductvariant";
import { DiscountVoucher } from "./DiscountVoucher";

@Index("discount_voucher_variants_pkey", ["id"], { unique: true })
@Index(
  "discount_voucher_variants_productvariant_id_dcab0bb4",
  ["productvariantId"],
  {}
)
@Index(
  "discount_voucher_variant_voucher_id_productvarian_64886a32_uniq",
  ["productvariantId", "voucherId"],
  { unique: true }
)
@Index("discount_voucher_variants_voucher_id_40d96698", ["voucherId"], {})
@Entity("discount_voucher_variants", { schema: "public" })
export class DiscountVoucherVariants {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "voucher_id", unique: true })
  voucherId: number;

  @Column("integer", { name: "productvariant_id", unique: true })
  productvariantId: number;

  @ManyToOne(
    () => ProductProductvariant,
    (productProductvariant) => productProductvariant.discountVoucherVariants
  )
  @JoinColumn([{ name: "productvariant_id", referencedColumnName: "id" }])
  productvariant: ProductProductvariant;

  @ManyToOne(
    () => DiscountVoucher,
    (discountVoucher) => discountVoucher.discountVoucherVariants
  )
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: DiscountVoucher;
}
