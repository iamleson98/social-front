import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChannel } from "./ChannelChannel";
import { ShippingShippingmethod } from "./ShippingShippingmethod";

@Index(
  "shipping_shippingmethodc_shipping_method_id_chann_dcc7298d_uniq",
  ["channelId", "shippingMethodId"],
  { unique: true }
)
@Index(
  "shipping_shippingmethodchannellisting_channel_id_10933a3c",
  ["channelId"],
  {}
)
@Index("shipping_shippingmethodchannellisting_pkey", ["id"], { unique: true })
@Index(
  "shipping_shippingmethodcha_shipping_method_id_20c0bc65",
  ["shippingMethodId"],
  {}
)
@Entity("shipping_shippingmethodchannellisting", { schema: "public" })
export class ShippingShippingmethodchannellisting {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("numeric", {
    name: "minimum_order_price_amount",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  minimumOrderPriceAmount: string | null;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("numeric", {
    name: "maximum_order_price_amount",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  maximumOrderPriceAmount: string | null;

  @Column("numeric", { name: "price_amount", precision: 12, scale: 3 })
  priceAmount: string;

  @Column("integer", { name: "channel_id", unique: true })
  channelId: number;

  @Column("integer", { name: "shipping_method_id", unique: true })
  shippingMethodId: number;

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.shippingShippingmethodchannellistings
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @ManyToOne(
    () => ShippingShippingmethod,
    (shippingShippingmethod) =>
      shippingShippingmethod.shippingShippingmethodchannellistings
  )
  @JoinColumn([{ name: "shipping_method_id", referencedColumnName: "id" }])
  shippingMethod: ShippingShippingmethod;
}
