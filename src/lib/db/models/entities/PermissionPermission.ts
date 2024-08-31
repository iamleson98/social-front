import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountGroupPermissions } from "./AccountGroupPermissions";
import { AccountUserUserPermissions } from "./AccountUserUserPermissions";
import { AppAppPermissions } from "./AppAppPermissions";
import { AppAppextensionPermissions } from "./AppAppextensionPermissions";
import { AppAppinstallationPermissions } from "./AppAppinstallationPermissions";
import { DjangoContentType } from "./DjangoContentType";

@Index(
  "permission_permission_content_type_id_codename_aa582bb6_uniq",
  ["codename", "contentTypeId"],
  { unique: true }
)
@Index("permission_permission_content_type_id_e526e8f2", ["contentTypeId"], {})
@Index("permission_permission_pkey", ["id"], { unique: true })
@Entity("permission_permission", { schema: "public" })
export class PermissionPermission {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("integer", { name: "content_type_id", unique: true })
  contentTypeId: number;

  @Column("character varying", { name: "codename", unique: true, length: 100 })
  codename: string;

  @OneToMany(
    () => AccountGroupPermissions,
    (accountGroupPermissions) => accountGroupPermissions.permission
  )
  accountGroupPermissions: AccountGroupPermissions[];

  @OneToMany(
    () => AccountUserUserPermissions,
    (accountUserUserPermissions) => accountUserUserPermissions.permission
  )
  accountUserUserPermissions: AccountUserUserPermissions[];

  @OneToMany(
    () => AppAppPermissions,
    (appAppPermissions) => appAppPermissions.permission
  )
  appAppPermissions: AppAppPermissions[];

  @OneToMany(
    () => AppAppextensionPermissions,
    (appAppextensionPermissions) => appAppextensionPermissions.permission
  )
  appAppextensionPermissions: AppAppextensionPermissions[];

  @OneToMany(
    () => AppAppinstallationPermissions,
    (appAppinstallationPermissions) => appAppinstallationPermissions.permission
  )
  appAppinstallationPermissions: AppAppinstallationPermissions[];

  @ManyToOne(
    () => DjangoContentType,
    (djangoContentType) => djangoContentType.permissionPermissions
  )
  @JoinColumn([{ name: "content_type_id", referencedColumnName: "id" }])
  contentType: DjangoContentType;
}
