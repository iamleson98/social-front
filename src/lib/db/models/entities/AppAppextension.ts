import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppApp } from "./AppApp";
import { AppAppextensionPermissions } from "./AppAppextensionPermissions";

@Index("app_appextension_app_id_4b2d27e9", ["appId"], {})
@Index("app_appextension_pkey", ["id"], { unique: true })
@Entity("app_appextension", { schema: "public" })
export class AppAppextension {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "label", length: 256 })
  label: string;

  @Column("character varying", { name: "url", length: 200 })
  url: string;

  @Column("integer", { name: "app_id" })
  appId: number;

  @Column("character varying", { name: "mount", length: 256 })
  mount: string;

  @Column("character varying", { name: "target", length: 128 })
  target: string;

  @ManyToOne(() => AppApp, (appApp) => appApp.appAppextensions)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @OneToMany(
    () => AppAppextensionPermissions,
    (appAppextensionPermissions) => appAppextensionPermissions.appextension
  )
  appAppextensionPermissions: AppAppextensionPermissions[];
}
