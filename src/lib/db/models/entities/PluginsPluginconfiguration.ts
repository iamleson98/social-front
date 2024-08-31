import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PluginsEmailtemplate } from "./PluginsEmailtemplate";
import { ChannelChannel } from "./ChannelChannel";

@Index(
  "plugins_pluginconfiguration_identifier_channel_id_c4cc3730_uniq",
  ["channelId", "identifier"],
  { unique: true }
)
@Index("plugins_pluginconfiguration_channel_id_c880e95c", ["channelId"], {})
@Index("plugins_pluginconfiguration_pkey", ["id"], { unique: true })
@Entity("plugins_pluginconfiguration", { schema: "public" })
export class PluginsPluginconfiguration {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 128 })
  name: string;

  @Column("text", { name: "description" })
  description: string;

  @Column("boolean", { name: "active" })
  active: boolean;

  @Column("jsonb", { name: "configuration", nullable: true })
  configuration: object | null;

  @Column("character varying", {
    name: "identifier",
    unique: true,
    length: 128,
  })
  identifier: string;

  @Column("integer", { name: "channel_id", nullable: true, unique: true })
  channelId: number | null;

  @OneToMany(
    () => PluginsEmailtemplate,
    (pluginsEmailtemplate) => pluginsEmailtemplate.pluginConfiguration
  )
  pluginsEmailtemplates: PluginsEmailtemplate[];

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.pluginsPluginconfigurations
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;
}
