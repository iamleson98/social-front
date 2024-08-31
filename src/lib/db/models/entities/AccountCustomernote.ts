import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountUser } from "./AccountUser";

@Index("account_customernote_customer_id_ec50cbf6", ["customerId"], {})
@Index("account_customernote_date_231c3474", ["date"], {})
@Index("account_customernote_pkey", ["id"], { unique: true })
@Index("account_customernote_user_id_b10a6c14", ["userId"], {})
@Entity("account_customernote", { schema: "public" })
export class AccountCustomernote {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "date" })
  date: Date;

  @Column("text", { name: "content" })
  content: string;

  @Column("boolean", { name: "is_public" })
  isPublic: boolean;

  @Column("integer", { name: "customer_id" })
  customerId: number;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.accountCustomernotes
  )
  @JoinColumn([{ name: "customer_id", referencedColumnName: "id" }])
  customer: AccountUser;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.accountCustomernotes2
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;
}
