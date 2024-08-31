import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppAppinstallation } from "./AppAppinstallation";
import { PermissionPermission } from "./PermissionPermission";

@Index(
  "app_appinstallation_perm_appinstallation_id_permi_7b7e0448_uniq",
  ["appinstallationId", "permissionId"],
  { unique: true }
)
@Index(
  "app_appinstallation_permissions_appinstallation_id_f7fe0271",
  ["appinstallationId"],
  {}
)
@Index("app_appinstallation_permissions_pkey", ["id"], { unique: true })
@Index(
  "app_appinstallation_permissions_permission_id_4ee9f6c8",
  ["permissionId"],
  {}
)
@Entity("app_appinstallation_permissions", { schema: "public" })
export class AppAppinstallationPermissions {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "appinstallation_id", unique: true })
  appinstallationId: number;

  @Column("integer", { name: "permission_id", unique: true })
  permissionId: number;

  @ManyToOne(
    () => AppAppinstallation,
    (appAppinstallation) => appAppinstallation.appAppinstallationPermissions
  )
  @JoinColumn([{ name: "appinstallation_id", referencedColumnName: "id" }])
  appinstallation: AppAppinstallation;

  @ManyToOne(
    () => PermissionPermission,
    (permissionPermission) => permissionPermission.appAppinstallationPermissions
  )
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: PermissionPermission;
}
