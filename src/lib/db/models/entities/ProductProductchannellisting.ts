import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChannel } from "./ChannelChannel";
import { ProductProduct } from "./ProductProduct";

@Index(
  "product_productchannelli_product_id_channel_id_f50170b5_uniq",
  ["channelId", "productId"],
  { unique: true }
)
@Index("product_productchannellisting_channel_id_f8b52350", ["channelId"], {})
@Index("product_pro_discoun_3145f3_btree", ["discountedPriceAmount"], {})
@Index("product_productchannellisting_pkey", ["id"], { unique: true })
@Index("product_productchannellisting_product_id_7838c7a9", ["productId"], {})
@Index("product_pro_publish_a3c049_idx", ["publishedAt"], {})
@Entity("product_productchannellisting", { schema: "public" })
export class ProductProductchannellisting {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "published_at", nullable: true })
  publishedAt: Date | null;

  @Column("boolean", { name: "is_published" })
  isPublished: boolean;

  @Column("integer", { name: "channel_id", unique: true })
  channelId: number;

  @Column("integer", { name: "product_id", unique: true })
  productId: number;

  @Column("numeric", {
    name: "discounted_price_amount",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  discountedPriceAmount: string | null;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("boolean", { name: "visible_in_listings" })
  visibleInListings: boolean;

  @Column("timestamp with time zone", {
    name: "available_for_purchase_at",
    nullable: true,
  })
  availableForPurchaseAt: Date | null;

  @Column("boolean", { name: "discounted_price_dirty", default: () => "false" })
  discountedPriceDirty: boolean;

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.productProductchannellistings
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @ManyToOne(
    () => ProductProduct,
    (productProduct) => productProduct.productProductchannellistings
  )
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: ProductProduct;
}
