import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppApp } from "./AppApp";
import { AccountUser } from "./AccountUser";
import { OrderOrder } from "./OrderOrder";

@Index("order_orderevent_app_id_2d642e9c", ["appId"], {})
@Index("order_orderevent_pkey", ["id"], { unique: true })
@Index("order_orderevent_order_token_id_56352b3d", ["orderId"], {})
@Index("order_orderevent_related_id_idx", ["relatedId"], {})
@Index("order_order_type_37fa0c_idx", ["type"], {})
@Index("order_orderevent_user_id_1056ac9c", ["userId"], {})
@Entity("order_orderevent", { schema: "public" })
export class OrderOrderevent {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "date" })
  date: Date;

  @Column("character varying", { name: "type", length: 255 })
  type: string;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("jsonb", { name: "parameters" })
  parameters: object;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("uuid", { name: "order_id" })
  orderId: string;

  @Column("integer", { name: "related_id", nullable: true })
  relatedId: number | null;

  @ManyToOne(() => AppApp, (appApp) => appApp.orderOrderevents)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(
    () => OrderOrderevent,
    (orderOrderevent) => orderOrderevent.orderOrderevents
  )
  @JoinColumn([{ name: "related_id", referencedColumnName: "id" }])
  related: OrderOrderevent;

  @OneToMany(
    () => OrderOrderevent,
    (orderOrderevent) => orderOrderevent.related
  )
  orderOrderevents: OrderOrderevent[];

  @ManyToOne(() => AccountUser, (accountUser) => accountUser.orderOrderevents)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;

  @ManyToOne(() => OrderOrder, (orderOrder) => orderOrder.orderOrderevents)
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;
}
