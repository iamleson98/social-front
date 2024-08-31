import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProduct } from "./ProductProduct";
import { ShippingShippingmethod } from "./ShippingShippingmethod";

@Index("shipping_shippingmethod_excluded_products_pkey", ["id"], {
  unique: true,
})
@Index(
  "shipping_shippingmethod_excluded_products_product_id_c2c20af6",
  ["productId"],
  {}
)
@Index(
  "shipping_shippingmethod__shippingmethod_id_produc_2c1bbd46_uniq",
  ["productId", "shippingmethodId"],
  { unique: true }
)
@Index(
  "shipping_shippingmethod_ex_shippingmethod_id_a522e057",
  ["shippingmethodId"],
  {}
)
@Entity("shipping_shippingmethod_excluded_products", { schema: "public" })
export class ShippingShippingmethodExcludedProducts {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "shippingmethod_id", unique: true })
  shippingmethodId: number;

  @Column("integer", { name: "product_id", unique: true })
  productId: number;

  @ManyToOne(
    () => ProductProduct,
    (productProduct) => productProduct.shippingShippingmethodExcludedProducts
  )
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: ProductProduct;

  @ManyToOne(
    () => ShippingShippingmethod,
    (shippingShippingmethod) =>
      shippingShippingmethod.shippingShippingmethodExcludedProducts
  )
  @JoinColumn([{ name: "shippingmethod_id", referencedColumnName: "id" }])
  shippingmethod: ShippingShippingmethod;
}
