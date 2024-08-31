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
import { PaymentTransactionitem } from "./PaymentTransactionitem";
import { AccountUser } from "./AccountUser";
import { OrderOrder } from "./OrderOrder";
import { OrderOrdergrantedrefundline } from "./OrderOrdergrantedrefundline";
import { PaymentTransactionevent } from "./PaymentTransactionevent";

@Index("order_ordergrantedrefund_app_id_38ac1ecf", ["appId"], {})
@Index("order_ordergrantedrefund_pkey", ["id"], { unique: true })
@Index("order_ordergrantedrefund_order_id_2905d3e7", ["orderId"], {})
@Index(
  "order_ordergrantedrefund_transaction_item_id_13928191",
  ["transactionItemId"],
  {}
)
@Index("order_ordergrantedrefund_updated_at_3aa80ec9", ["updatedAt"], {})
@Index("order_ordergrantedrefund_user_id_f344f8ec", ["userId"], {})
@Entity("order_ordergrantedrefund", { schema: "public" })
export class OrderOrdergrantedrefund {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("numeric", { name: "amount_value", precision: 12, scale: 3 })
  amountValue: string;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("text", { name: "reason" })
  reason: string;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("uuid", { name: "order_id" })
  orderId: string;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("boolean", {
    name: "shipping_costs_included",
    default: () => "false",
  })
  shippingCostsIncluded: boolean;

  @Column("integer", { name: "transaction_item_id", nullable: true })
  transactionItemId: number | null;

  @Column("character varying", {
    name: "status",
    length: 128,
    default: () => "'none'",
  })
  status: string;

  @ManyToOne(() => AppApp, (appApp) => appApp.orderOrdergrantedrefunds)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(
    () => PaymentTransactionitem,
    (paymentTransactionitem) => paymentTransactionitem.orderOrdergrantedrefunds
  )
  @JoinColumn([{ name: "transaction_item_id", referencedColumnName: "id" }])
  transactionItem: PaymentTransactionitem;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.orderOrdergrantedrefunds
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;

  @ManyToOne(
    () => OrderOrder,
    (orderOrder) => orderOrder.orderOrdergrantedrefunds
  )
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;

  @OneToMany(
    () => OrderOrdergrantedrefundline,
    (orderOrdergrantedrefundline) => orderOrdergrantedrefundline.grantedRefund
  )
  orderOrdergrantedrefundlines: OrderOrdergrantedrefundline[];

  @OneToMany(
    () => PaymentTransactionevent,
    (paymentTransactionevent) => paymentTransactionevent.relatedGrantedRefund
  )
  paymentTransactionevents: PaymentTransactionevent[];
}
