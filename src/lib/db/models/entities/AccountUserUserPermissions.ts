import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PermissionPermission } from "./PermissionPermission";
import { AccountUser } from "./AccountUser";

@Index("userprofile_user_user_permissions_pkey", ["id"], { unique: true })
@Index(
  "userprofile_user_user_pe_user_id_permission_id_706d65c8_uniq",
  ["permissionId", "userId"],
  { unique: true }
)
@Index(
  "userprofile_user_user_permissions_permission_id_1caa8a71",
  ["permissionId"],
  {}
)
@Index("userprofile_user_user_permissions_user_id_6d654469", ["userId"], {})
@Entity("account_user_user_permissions", { schema: "public" })
export class AccountUserUserPermissions {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "user_id", unique: true })
  userId: number;

  @Column("integer", { name: "permission_id", unique: true })
  permissionId: number;

  @ManyToOne(
    () => PermissionPermission,
    (permissionPermission) => permissionPermission.accountUserUserPermissions
  )
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: PermissionPermission;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.accountUserUserPermissions
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;
}
