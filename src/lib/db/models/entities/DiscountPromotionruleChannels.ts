import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChannel } from "./ChannelChannel";
import { DiscountPromotionrule } from "./DiscountPromotionrule";

@Index(
  "discount_promotionrule_c_promotionrule_id_channel_561c4e6e_uniq",
  ["channelId", "promotionruleId"],
  { unique: true }
)
@Index("discount_promotionrule_channels_channel_id_698c2436", ["channelId"], {})
@Index("discount_promotionrule_channels_pkey", ["id"], { unique: true })
@Index(
  "discount_promotionrule_channels_promotionrule_id_878da3b9",
  ["promotionruleId"],
  {}
)
@Entity("discount_promotionrule_channels", { schema: "public" })
export class DiscountPromotionruleChannels {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "promotionrule_id", unique: true })
  promotionruleId: string;

  @Column("integer", { name: "channel_id", unique: true })
  channelId: number;

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.discountPromotionruleChannels
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @ManyToOne(
    () => DiscountPromotionrule,
    (discountPromotionrule) =>
      discountPromotionrule.discountPromotionruleChannels
  )
  @JoinColumn([{ name: "promotionrule_id", referencedColumnName: "id" }])
  promotionrule: DiscountPromotionrule;
}
