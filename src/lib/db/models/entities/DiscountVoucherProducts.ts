import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProduct } from "./ProductProduct";
import { DiscountVoucher } from "./DiscountVoucher";

@Index("discount_voucher_products_pkey", ["id"], { unique: true })
@Index("discount_voucher_products_product_id_4a3131ff", ["productId"], {})
@Index(
  "discount_voucher_products_voucher_id_product_id_2b092ec4_uniq",
  ["productId", "voucherId"],
  { unique: true }
)
@Index("discount_voucher_products_voucher_id_8a2e6c3a", ["voucherId"], {})
@Entity("discount_voucher_products", { schema: "public" })
export class DiscountVoucherProducts {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "voucher_id", unique: true })
  voucherId: number;

  @Column("integer", { name: "product_id", unique: true })
  productId: number;

  @ManyToOne(
    () => ProductProduct,
    (productProduct) => productProduct.discountVoucherProducts
  )
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: ProductProduct;

  @ManyToOne(
    () => DiscountVoucher,
    (discountVoucher) => discountVoucher.discountVoucherProducts
  )
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: DiscountVoucher;
}
