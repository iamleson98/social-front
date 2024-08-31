import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountGroup } from "./AccountGroup";
import { PermissionPermission } from "./PermissionPermission";

@Index(
  "account_group_permissions_group_id_permission_id_745742e5_uniq",
  ["groupId", "permissionId"],
  { unique: true }
)
@Index("account_group_permissions_group_id_37f7fcd9", ["groupId"], {})
@Index("account_group_permissions_pkey", ["id"], { unique: true })
@Index("account_group_permissions_permission_id_f654f978", ["permissionId"], {})
@Entity("account_group_permissions", { schema: "public" })
export class AccountGroupPermissions {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "group_id", unique: true })
  groupId: number;

  @Column("integer", { name: "permission_id", unique: true })
  permissionId: number;

  @ManyToOne(
    () => AccountGroup,
    (accountGroup) => accountGroup.accountGroupPermissions
  )
  @JoinColumn([{ name: "group_id", referencedColumnName: "id" }])
  group: AccountGroup;

  @ManyToOne(
    () => PermissionPermission,
    (permissionPermission) => permissionPermission.accountGroupPermissions
  )
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: PermissionPermission;
}
