import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductCategory } from "./ProductCategory";
import { DiscountVoucher } from "./DiscountVoucher";

@Index("discount_voucher_categories_category_id_fc9d044a", ["categoryId"], {})
@Index(
  "discount_voucher_categor_voucher_id_category_id_bb5f8954_uniq",
  ["categoryId", "voucherId"],
  { unique: true }
)
@Index("discount_voucher_categories_pkey", ["id"], { unique: true })
@Index("discount_voucher_categories_voucher_id_19a56338", ["voucherId"], {})
@Entity("discount_voucher_categories", { schema: "public" })
export class DiscountVoucherCategories {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "voucher_id", unique: true })
  voucherId: number;

  @Column("integer", { name: "category_id", unique: true })
  categoryId: number;

  @ManyToOne(
    () => ProductCategory,
    (productCategory) => productCategory.discountVoucherCategories
  )
  @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
  category: ProductCategory;

  @ManyToOne(
    () => DiscountVoucher,
    (discountVoucher) => discountVoucher.discountVoucherCategories
  )
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: DiscountVoucher;
}
