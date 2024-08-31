import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChannel } from "./ChannelChannel";
import { ShippingShippingzone } from "./ShippingShippingzone";

@Index("shipping_shippingzone_channels_channel_id_36548abc", ["channelId"], {})
@Index(
  "shipping_shippingzone_ch_shippingzone_id_channel__509bee3d_uniq",
  ["channelId", "shippingzoneId"],
  { unique: true }
)
@Index("shipping_shippingzone_channels_pkey", ["id"], { unique: true })
@Index(
  "shipping_shippingzone_channels_shippingzone_id_6724d6e4",
  ["shippingzoneId"],
  {}
)
@Entity("shipping_shippingzone_channels", { schema: "public" })
export class ShippingShippingzoneChannels {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "shippingzone_id", unique: true })
  shippingzoneId: number;

  @Column("integer", { name: "channel_id", unique: true })
  channelId: number;

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.shippingShippingzoneChannels
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @ManyToOne(
    () => ShippingShippingzone,
    (shippingShippingzone) => shippingShippingzone.shippingShippingzoneChannels
  )
  @JoinColumn([{ name: "shippingzone_id", referencedColumnName: "id" }])
  shippingzone: ShippingShippingzone;
}
