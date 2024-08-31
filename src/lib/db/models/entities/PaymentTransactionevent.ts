import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppApp } from "./AppApp";
import { OrderOrdergrantedrefund } from "./OrderOrdergrantedrefund";
import { PaymentTransactionitem } from "./PaymentTransactionitem";
import { AccountUser } from "./AccountUser";

@Index("payment_transactionevent_app_id_98888f6d", ["appId"], {})
@Index("payment_transactionevent_pkey", ["id"], { unique: true })
@Index(
  "unique_transaction_event_idempotency",
  ["idempotencyKey", "transactionId"],
  { unique: true }
)
@Index(
  "payment_transactionevent_related_granted_refund_id_bc5e73e4",
  ["relatedGrantedRefundId"],
  {}
)
@Index(
  "payment_transactionevent_transaction_id_381f97d4",
  ["transactionId"],
  {}
)
@Index("payment_transactionevent_user_id_7f9244da", ["userId"], {})
@Entity("payment_transactionevent", { schema: "public" })
export class PaymentTransactionevent {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("character varying", { name: "status", nullable: true, length: 128 })
  status: string | null;

  @Column("integer", { name: "transaction_id", unique: true })
  transactionId: number;

  @Column("numeric", {
    name: "amount_value",
    precision: 12,
    scale: 3,
    default: () => "0",
  })
  amountValue: string;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("character varying", {
    name: "app_identifier",
    nullable: true,
    length: 256,
  })
  appIdentifier: string | null;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("character varying", {
    name: "external_url",
    nullable: true,
    length: 200,
  })
  externalUrl: string | null;

  @Column("boolean", {
    name: "include_in_calculations",
    default: () => "false",
  })
  includeInCalculations: boolean;

  @Column("character varying", { name: "message", nullable: true, length: 512 })
  message: string | null;

  @Column("character varying", {
    name: "psp_reference",
    nullable: true,
    length: 512,
  })
  pspReference: string | null;

  @Column("character varying", {
    name: "type",
    length: 128,
    default: () => "'info'",
  })
  type: string;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("character varying", {
    name: "idempotency_key",
    nullable: true,
    unique: true,
    length: 512,
  })
  idempotencyKey: string | null;

  @Column("integer", { name: "related_granted_refund_id", nullable: true })
  relatedGrantedRefundId: number | null;

  @ManyToOne(() => AppApp, (appApp) => appApp.paymentTransactionevents)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(
    () => OrderOrdergrantedrefund,
    (orderOrdergrantedrefund) =>
      orderOrdergrantedrefund.paymentTransactionevents
  )
  @JoinColumn([
    { name: "related_granted_refund_id", referencedColumnName: "id" },
  ])
  relatedGrantedRefund: OrderOrdergrantedrefund;

  @ManyToOne(
    () => PaymentTransactionitem,
    (paymentTransactionitem) => paymentTransactionitem.paymentTransactionevents
  )
  @JoinColumn([{ name: "transaction_id", referencedColumnName: "id" }])
  transaction: PaymentTransactionitem;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.paymentTransactionevents
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;
}
