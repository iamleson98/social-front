import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProductvariantchannellisting } from "./ProductProductvariantchannellisting";
import { OrderOrderline } from "./OrderOrderline";

@Index("warehouse_preorderallocation_pkey", ["id"], { unique: true })
@Index(
  "warehouse_preorderallocation_order_line_token_id_5c2ada8e",
  ["orderLineId"],
  {}
)
@Index(
  "warehouse_preorderallocati_product_variant_channel_li_d243ee40",
  ["productVariantChannelListingId"],
  {}
)
@Entity("warehouse_preorderallocation", { schema: "public" })
export class WarehousePreorderallocation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "quantity" })
  quantity: number;

  @Column("integer", { name: "product_variant_channel_listing_id" })
  productVariantChannelListingId: number;

  @Column("uuid", { name: "order_line_id" })
  orderLineId: string;

  @ManyToOne(
    () => ProductProductvariantchannellisting,
    (productProductvariantchannellisting) =>
      productProductvariantchannellisting.warehousePreorderallocations
  )
  @JoinColumn([
    { name: "product_variant_channel_listing_id", referencedColumnName: "id" },
  ])
  productVariantChannelListing: ProductProductvariantchannellisting;

  @ManyToOne(
    () => OrderOrderline,
    (orderOrderline) => orderOrderline.warehousePreorderallocations
  )
  @JoinColumn([{ name: "order_line_id", referencedColumnName: "id" }])
  orderLine: OrderOrderline;
}
