import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppAppinstallationPermissions } from "./AppAppinstallationPermissions";
import { ThumbnailThumbnail } from "./ThumbnailThumbnail";

@Index("app_appinstallation_pkey", ["id"], { unique: true })
@Index("app_appinstallation_uuid_key", ["uuid"], { unique: true })
@Entity("app_appinstallation", { schema: "public" })
export class AppAppinstallation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "status", length: 50 })
  status: string;

  @Column("character varying", { name: "message", nullable: true, length: 255 })
  message: string | null;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("character varying", { name: "app_name", length: 60 })
  appName: string;

  @Column("character varying", { name: "manifest_url", length: 200 })
  manifestUrl: string;

  @Column("uuid", { name: "uuid", unique: true })
  uuid: string;

  @Column("character varying", {
    name: "brand_logo_default",
    nullable: true,
    length: 100,
  })
  brandLogoDefault: string | null;

  @OneToMany(
    () => AppAppinstallationPermissions,
    (appAppinstallationPermissions) =>
      appAppinstallationPermissions.appinstallation
  )
  appAppinstallationPermissions: AppAppinstallationPermissions[];

  @OneToMany(
    () => ThumbnailThumbnail,
    (thumbnailThumbnail) => thumbnailThumbnail.appInstallation
  )
  thumbnailThumbnails: ThumbnailThumbnail[];
}
