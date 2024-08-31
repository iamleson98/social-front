import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountAddress } from "./AccountAddress";
import { AccountUser } from "./AccountUser";

@Index("userprofile_user_addresses_address_id_ad7646b4", ["addressId"], {})
@Index(
  "userprofile_user_addresses_user_id_address_id_6cb87bcc_uniq",
  ["addressId", "userId"],
  { unique: true }
)
@Index("userprofile_user_addresses_pkey", ["id"], { unique: true })
@Index("userprofile_user_addresses_user_id_bb5aa55e", ["userId"], {})
@Entity("account_user_addresses", { schema: "public" })
export class AccountUserAddresses {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "user_id", unique: true })
  userId: number;

  @Column("integer", { name: "address_id", unique: true })
  addressId: number;

  @ManyToOne(
    () => AccountAddress,
    (accountAddress) => accountAddress.accountUserAddresses
  )
  @JoinColumn([{ name: "address_id", referencedColumnName: "id" }])
  address: AccountAddress;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.accountUserAddresses
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;
}
