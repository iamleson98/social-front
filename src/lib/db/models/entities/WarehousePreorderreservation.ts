import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProductvariantchannellisting } from "./ProductProductvariantchannellisting";
import { CheckoutCheckoutline } from "./CheckoutCheckoutline";

@Index(
  "warehouse_preorderreservation_checkout_line_token_id_e35f4484",
  ["checkoutLineId"],
  {}
)
@Index("warehouse_preorderreservation_pkey", ["id"], { unique: true })
@Index(
  "warehouse_preorderreservat_product_variant_channel_li_3c2d488e",
  ["productVariantChannelListingId"],
  {}
)
@Entity("warehouse_preorderreservation", { schema: "public" })
export class WarehousePreorderreservation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "quantity_reserved" })
  quantityReserved: number;

  @Column("timestamp with time zone", { name: "reserved_until" })
  reservedUntil: Date;

  @Column("integer", { name: "product_variant_channel_listing_id" })
  productVariantChannelListingId: number;

  @Column("uuid", { name: "checkout_line_id" })
  checkoutLineId: string;

  @ManyToOne(
    () => ProductProductvariantchannellisting,
    (productProductvariantchannellisting) =>
      productProductvariantchannellisting.warehousePreorderreservations
  )
  @JoinColumn([
    { name: "product_variant_channel_listing_id", referencedColumnName: "id" },
  ])
  productVariantChannelListing: ProductProductvariantchannellisting;

  @ManyToOne(
    () => CheckoutCheckoutline,
    (checkoutCheckoutline) => checkoutCheckoutline.warehousePreorderreservations
  )
  @JoinColumn([{ name: "checkout_line_id", referencedColumnName: "id" }])
  checkoutLine: CheckoutCheckoutline;
}
