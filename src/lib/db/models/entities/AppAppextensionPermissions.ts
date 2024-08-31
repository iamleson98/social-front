import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppAppextension } from "./AppAppextension";
import { PermissionPermission } from "./PermissionPermission";

@Index(
  "app_appextension_permissions_appextension_id_8ad99c02",
  ["appextensionId"],
  {}
)
@Index(
  "app_appextension_permiss_appextension_id_permissi_04ce63c6_uniq",
  ["appextensionId", "permissionId"],
  { unique: true }
)
@Index("app_appextension_permissions_pkey", ["id"], { unique: true })
@Index(
  "app_appextension_permissions_permission_id_cb6c3ce0",
  ["permissionId"],
  {}
)
@Entity("app_appextension_permissions", { schema: "public" })
export class AppAppextensionPermissions {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "appextension_id", unique: true })
  appextensionId: number;

  @Column("integer", { name: "permission_id", unique: true })
  permissionId: number;

  @ManyToOne(
    () => AppAppextension,
    (appAppextension) => appAppextension.appAppextensionPermissions
  )
  @JoinColumn([{ name: "appextension_id", referencedColumnName: "id" }])
  appextension: AppAppextension;

  @ManyToOne(
    () => PermissionPermission,
    (permissionPermission) => permissionPermission.appAppextensionPermissions
  )
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: PermissionPermission;
}
