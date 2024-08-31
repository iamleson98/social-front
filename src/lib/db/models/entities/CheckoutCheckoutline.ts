import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ProductProductvariant } from "./ProductProductvariant";
import { CheckoutCheckout } from "./CheckoutCheckout";
import { DiscountCheckoutlinediscount } from "./DiscountCheckoutlinediscount";
import { WarehousePreorderreservation } from "./WarehousePreorderreservation";
import { WarehouseReservation } from "./WarehouseReservation";

@Index("cart_cartline_cart_id_c7b9981e", ["checkoutId"], {})
@Index("checkout_checkoutline_token_bc62c7b0_pk", ["id"], { unique: true })
@Index("checkoutline_meta_idx", ["metadata"], {})
@Index("checkout_checkoutline_old_id_key", ["oldId"], { unique: true })
@Index("checkoutline_p_meta_idx", ["privateMetadata"], {})
@Index("cart_cartline_product_id_1a54130f", ["variantId"], {})
@Entity("checkout_checkoutline", { schema: "public" })
export class CheckoutCheckoutline {
  @Column("integer", { name: "quantity" })
  quantity: number;

  @Column("uuid", { name: "checkout_id" })
  checkoutId: string;

  @Column("integer", { name: "variant_id" })
  variantId: number;

  @Column("numeric", {
    name: "price_override",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  priceOverride: string | null;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("integer", { name: "old_id", nullable: true, unique: true })
  oldId: number | null;

  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("numeric", { name: "tax_rate", precision: 5, scale: 4 })
  taxRate: string;

  @Column("numeric", {
    name: "total_price_gross_amount",
    precision: 12,
    scale: 3,
  })
  totalPriceGrossAmount: string;

  @Column("numeric", {
    name: "total_price_net_amount",
    precision: 12,
    scale: 3,
  })
  totalPriceNetAmount: string;

  @Column("boolean", { name: "is_gift", default: () => "false" })
  isGift: boolean;

  @ManyToOne(
    () => ProductProductvariant,
    (productProductvariant) => productProductvariant.checkoutCheckoutlines
  )
  @JoinColumn([{ name: "variant_id", referencedColumnName: "id" }])
  variant: ProductProductvariant;

  @ManyToOne(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.checkoutCheckoutlines
  )
  @JoinColumn([{ name: "checkout_id", referencedColumnName: "token" }])
  checkout: CheckoutCheckout;

  @OneToMany(
    () => DiscountCheckoutlinediscount,
    (discountCheckoutlinediscount) => discountCheckoutlinediscount.line
  )
  discountCheckoutlinediscounts: DiscountCheckoutlinediscount[];

  @OneToMany(
    () => WarehousePreorderreservation,
    (warehousePreorderreservation) => warehousePreorderreservation.checkoutLine
  )
  warehousePreorderreservations: WarehousePreorderreservation[];

  @OneToMany(
    () => WarehouseReservation,
    (warehouseReservation) => warehouseReservation.checkoutLine
  )
  warehouseReservations: WarehouseReservation[];
}
