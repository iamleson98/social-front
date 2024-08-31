import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChannel } from "./ChannelChannel";
import { DiscountVoucher } from "./DiscountVoucher";

@Index("discount_voucherchannellisting_channel_id_09f3ed34", ["channelId"], {})
@Index(
  "discount_voucherchannell_voucher_id_channel_id_ef4fd653_uniq",
  ["channelId", "voucherId"],
  { unique: true }
)
@Index("discount_voucherchannellisting_pkey", ["id"], { unique: true })
@Index("discount_voucherchannellisting_voucher_id_7963fcbd", ["voucherId"], {})
@Entity("discount_voucherchannellisting", { schema: "public" })
export class DiscountVoucherchannellisting {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("numeric", { name: "discount_value", precision: 12, scale: 3 })
  discountValue: string;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("numeric", {
    name: "min_spent_amount",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  minSpentAmount: string | null;

  @Column("integer", { name: "channel_id", unique: true })
  channelId: number;

  @Column("integer", { name: "voucher_id", unique: true })
  voucherId: number;

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.discountVoucherchannellistings
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @ManyToOne(
    () => DiscountVoucher,
    (discountVoucher) => discountVoucher.discountVoucherchannellistings
  )
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: DiscountVoucher;
}
