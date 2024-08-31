import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppApp } from "./AppApp";
import { AccountUser } from "./AccountUser";
import { OrderOrder } from "./OrderOrder";

@Index("account_customerevent_app_id_b022b4d7", ["appId"], {})
@Index("account_customerevent_pkey", ["id"], { unique: true })
@Index("account_customerevent_order_token_id_fd941a39", ["orderId"], {})
@Index("account_customerevent_user_id_b3d6ec36", ["userId"], {})
@Entity("account_customerevent", { schema: "public" })
export class AccountCustomerevent {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "date" })
  date: Date;

  @Column("character varying", { name: "type", length: 255 })
  type: string;

  @Column("jsonb", { name: "parameters" })
  parameters: object;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("uuid", { name: "order_id", nullable: true })
  orderId: string | null;

  @ManyToOne(() => AppApp, (appApp) => appApp.accountCustomerevents)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.accountCustomerevents
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;

  @ManyToOne(() => OrderOrder, (orderOrder) => orderOrder.accountCustomerevents)
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;
}
