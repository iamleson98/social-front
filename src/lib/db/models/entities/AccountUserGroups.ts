import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountGroup } from "./AccountGroup";
import { AccountUser } from "./AccountUser";

@Index("userprofile_user_groups_group_id_c7eec74e", ["groupId"], {})
@Index(
  "userprofile_user_groups_user_id_group_id_90ce1781_uniq",
  ["groupId", "userId"],
  { unique: true }
)
@Index("userprofile_user_groups_pkey", ["id"], { unique: true })
@Index("userprofile_user_groups_user_id_5e712a24", ["userId"], {})
@Entity("account_user_groups", { schema: "public" })
export class AccountUserGroups {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "user_id", unique: true })
  userId: number;

  @Column("integer", { name: "group_id", unique: true })
  groupId: number;

  @ManyToOne(
    () => AccountGroup,
    (accountGroup) => accountGroup.accountUserGroups
  )
  @JoinColumn([{ name: "group_id", referencedColumnName: "id" }])
  group: AccountGroup;

  @ManyToOne(() => AccountUser, (accountUser) => accountUser.accountUserGroups)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;
}
