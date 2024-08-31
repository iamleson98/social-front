import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChannel } from "./ChannelChannel";
import { AccountGroup } from "./AccountGroup";

@Index(
  "account_group_channels_group_id_channel_id_b6d749af_uniq",
  ["channelId", "groupId"],
  { unique: true }
)
@Index("account_group_channels_channel_id_04ca83ef", ["channelId"], {})
@Index("account_group_channels_group_id_301893d0", ["groupId"], {})
@Index("account_group_channels_pkey", ["id"], { unique: true })
@Entity("account_group_channels", { schema: "public" })
export class AccountGroupChannels {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "group_id", unique: true })
  groupId: number;

  @Column("integer", { name: "channel_id", unique: true })
  channelId: number;

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.accountGroupChannels
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @ManyToOne(
    () => AccountGroup,
    (accountGroup) => accountGroup.accountGroupChannels
  )
  @JoinColumn([{ name: "group_id", referencedColumnName: "id" }])
  group: AccountGroup;
}
