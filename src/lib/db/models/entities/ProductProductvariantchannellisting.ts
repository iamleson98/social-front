import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChannel } from "./ChannelChannel";
import { ProductProductvariant } from "./ProductProductvariant";
import { ProductVariantchannellistingpromotionrule } from "./ProductVariantchannellistingpromotionrule";
import { WarehousePreorderallocation } from "./WarehousePreorderallocation";
import { WarehousePreorderreservation } from "./WarehousePreorderreservation";

@Index(
  "product_productvariantchannellisting_channel_id_23e849ed",
  ["channelId"],
  {}
)
@Index(
  "product_productvariantch_variant_id_channel_id_123d5440_uniq",
  ["channelId", "variantId"],
  { unique: true }
)
@Index("product_pro_price_a_fb6bd3_gin", ["channelId", "priceAmount"], {})
@Index("product_productvariantchannellisting_pkey", ["id"], { unique: true })
@Index(
  "product_productvariantchannellisting_variant_id_f8e7abba",
  ["variantId"],
  {}
)
@Entity("product_productvariantchannellisting", { schema: "public" })
export class ProductProductvariantchannellisting {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("numeric", {
    name: "price_amount",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  priceAmount: string | null;

  @Column("integer", { name: "channel_id", unique: true })
  channelId: number;

  @Column("integer", { name: "variant_id", unique: true })
  variantId: number;

  @Column("numeric", {
    name: "cost_price_amount",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  costPriceAmount: string | null;

  @Column("integer", { name: "preorder_quantity_threshold", nullable: true })
  preorderQuantityThreshold: number | null;

  @Column("numeric", {
    name: "discounted_price_amount",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  discountedPriceAmount: string | null;

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.productProductvariantchannellistings
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @ManyToOne(
    () => ProductProductvariant,
    (productProductvariant) =>
      productProductvariant.productProductvariantchannellistings
  )
  @JoinColumn([{ name: "variant_id", referencedColumnName: "id" }])
  variant: ProductProductvariant;

  @OneToMany(
    () => ProductVariantchannellistingpromotionrule,
    (productVariantchannellistingpromotionrule) =>
      productVariantchannellistingpromotionrule.variantChannelListing
  )
  productVariantchannellistingpromotionrules: ProductVariantchannellistingpromotionrule[];

  @OneToMany(
    () => WarehousePreorderallocation,
    (warehousePreorderallocation) =>
      warehousePreorderallocation.productVariantChannelListing
  )
  warehousePreorderallocations: WarehousePreorderallocation[];

  @OneToMany(
    () => WarehousePreorderreservation,
    (warehousePreorderreservation) =>
      warehousePreorderreservation.productVariantChannelListing
  )
  warehousePreorderreservations: WarehousePreorderreservation[];
}
