import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountGroupChannels } from "./AccountGroupChannels";
import { AccountGroupPermissions } from "./AccountGroupPermissions";
import { AccountUserGroups } from "./AccountUserGroups";

@Index("account_group_pkey", ["id"], { unique: true })
@Index("account_group_name_key", ["name"], { unique: true })
@Index("account_group_name_034e9f3f_like", ["name"], {})
@Entity("account_group", { schema: "public" })
export class AccountGroup {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", unique: true, length: 150 })
  name: string;

  @Column("boolean", {
    name: "restricted_access_to_channels",
    default: () => "false",
  })
  restrictedAccessToChannels: boolean;

  @OneToMany(
    () => AccountGroupChannels,
    (accountGroupChannels) => accountGroupChannels.group
  )
  accountGroupChannels: AccountGroupChannels[];

  @OneToMany(
    () => AccountGroupPermissions,
    (accountGroupPermissions) => accountGroupPermissions.group
  )
  accountGroupPermissions: AccountGroupPermissions[];

  @OneToMany(
    () => AccountUserGroups,
    (accountUserGroups) => accountUserGroups.group
  )
  accountUserGroups: AccountUserGroups[];
}
