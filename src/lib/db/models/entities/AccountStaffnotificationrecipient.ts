import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountUser } from "./AccountUser";

@Index("account_staffnotificationrecipient_pkey", ["id"], { unique: true })
@Index(
  "account_staffnotificationrecipient_staff_email_a309b82e_like",
  ["staffEmail"],
  {}
)
@Index("account_staffnotificationrecipient_staff_email_key", ["staffEmail"], {
  unique: true,
})
@Index("account_staffnotificationrecipient_user_id_key", ["userId"], {
  unique: true,
})
@Entity("account_staffnotificationrecipient", { schema: "public" })
export class AccountStaffnotificationrecipient {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "staff_email",
    nullable: true,
    unique: true,
    length: 254,
  })
  staffEmail: string | null;

  @Column("boolean", { name: "active" })
  active: boolean;

  @Column("integer", { name: "user_id", nullable: true, unique: true })
  userId: number | null;

  @OneToOne(
    () => AccountUser,
    (accountUser) => accountUser.accountStaffnotificationrecipient
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;
}
