import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppApp } from "./AppApp";
import { PermissionPermission } from "./PermissionPermission";

@Index(
  "account_serviceaccount_permissions_serviceaccount_id_ec78f497",
  ["appId"],
  {}
)
@Index(
  "app_app_permissions_app_id_permission_id_0e940a82_uniq",
  ["appId", "permissionId"],
  { unique: true }
)
@Index("app_app_permissions_pkey", ["id"], { unique: true })
@Index(
  "account_serviceaccount_permissions_permission_id_449791f0",
  ["permissionId"],
  {}
)
@Entity("app_app_permissions", { schema: "public" })
export class AppAppPermissions {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "app_id", unique: true })
  appId: number;

  @Column("integer", { name: "permission_id", unique: true })
  permissionId: number;

  @ManyToOne(() => AppApp, (appApp) => appApp.appAppPermissions)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(
    () => PermissionPermission,
    (permissionPermission) => permissionPermission.appAppPermissions
  )
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: PermissionPermission;
}
