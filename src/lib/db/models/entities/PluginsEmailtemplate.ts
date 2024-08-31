import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PluginsPluginconfiguration } from "./PluginsPluginconfiguration";

@Index("plugins_emailtemplate_pkey", ["id"], { unique: true })
@Index(
  "plugins_emailtemplate_plugin_configuration_id_9abac2f2",
  ["pluginConfigurationId"],
  {}
)
@Entity("plugins_emailtemplate", { schema: "public" })
export class PluginsEmailtemplate {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("text", { name: "value" })
  value: string;

  @Column("integer", { name: "plugin_configuration_id" })
  pluginConfigurationId: number;

  @ManyToOne(
    () => PluginsPluginconfiguration,
    (pluginsPluginconfiguration) =>
      pluginsPluginconfiguration.pluginsEmailtemplates
  )
  @JoinColumn([{ name: "plugin_configuration_id", referencedColumnName: "id" }])
  pluginConfiguration: PluginsPluginconfiguration;
}
