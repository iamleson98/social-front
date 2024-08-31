import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderOrdergrantedrefund } from "./OrderOrdergrantedrefund";
import { PaymentTransactionevent } from "./PaymentTransactionevent";
import { AppApp } from "./AppApp";
import { AccountUser } from "./AccountUser";
import { CheckoutCheckout } from "./CheckoutCheckout";
import { OrderOrder } from "./OrderOrder";

@Index("payment_transactionitem_app_id_75ae2f40", ["appId"], {})
@Index("unique_transaction_idempotency", ["appIdentifier", "idempotencyKey"], {
  unique: true,
})
@Index("payment_transactionitem_checkout_id_bc8a405f", ["checkoutId"], {})
@Index("payment_transactionitem_pkey", ["id"], { unique: true })
@Index("transactionitem_meta_idx", ["metadata"], {})
@Index("payment_transactionitem_order_id_1e36872b", ["orderId"], {})
@Index("transactionitem_p_meta_idx", ["privateMetadata"], {})
@Index("payment_transactionitem_token_key", ["token"], { unique: true })
@Index("payment_transactionitem_user_id_780fab59", ["userId"], {})
@Entity("payment_transactionitem", { schema: "public" })
export class PaymentTransactionitem {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "modified_at" })
  modifiedAt: Date;

  @Column("character varying", { name: "status", nullable: true, length: 512 })
  status: string | null;

  @Column("varchar", { name: "available_actions", array: true })
  availableActions: string[];

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("numeric", { name: "charged_value", precision: 12, scale: 3 })
  chargedValue: string;

  @Column("numeric", { name: "authorized_value", precision: 12, scale: 3 })
  authorizedValue: string;

  @Column("numeric", { name: "refunded_value", precision: 12, scale: 3 })
  refundedValue: string;

  @Column("uuid", { name: "checkout_id", nullable: true })
  checkoutId: string | null;

  @Column("uuid", { name: "order_id", nullable: true })
  orderId: string | null;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("character varying", {
    name: "app_identifier",
    nullable: true,
    unique: true,
    length: 256,
  })
  appIdentifier: string | null;

  @Column("numeric", {
    name: "authorize_pending_value",
    precision: 12,
    scale: 3,
    default: () => "0",
  })
  authorizePendingValue: string;

  @Column("numeric", {
    name: "cancel_pending_value",
    precision: 12,
    scale: 3,
    default: () => "0",
  })
  cancelPendingValue: string;

  @Column("numeric", {
    name: "canceled_value",
    precision: 12,
    scale: 3,
    default: () => "0",
  })
  canceledValue: string;

  @Column("numeric", {
    name: "charge_pending_value",
    precision: 12,
    scale: 3,
    default: () => "0",
  })
  chargePendingValue: string;

  @Column("character varying", {
    name: "external_url",
    nullable: true,
    length: 200,
  })
  externalUrl: string | null;

  @Column("character varying", { name: "message", nullable: true, length: 512 })
  message: string | null;

  @Column("character varying", { name: "name", nullable: true, length: 512 })
  name: string | null;

  @Column("character varying", {
    name: "psp_reference",
    nullable: true,
    length: 512,
  })
  pspReference: string | null;

  @Column("numeric", {
    name: "refund_pending_value",
    precision: 12,
    scale: 3,
    default: () => "0",
  })
  refundPendingValue: string;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("uuid", { name: "token", unique: true })
  token: string;

  @Column("boolean", { name: "use_old_id", default: () => "false" })
  useOldId: boolean;

  @Column("boolean", { name: "last_refund_success", default: () => "true" })
  lastRefundSuccess: boolean;

  @Column("character varying", {
    name: "idempotency_key",
    nullable: true,
    unique: true,
    length: 512,
  })
  idempotencyKey: string | null;

  @OneToMany(
    () => OrderOrdergrantedrefund,
    (orderOrdergrantedrefund) => orderOrdergrantedrefund.transactionItem
  )
  orderOrdergrantedrefunds: OrderOrdergrantedrefund[];

  @OneToMany(
    () => PaymentTransactionevent,
    (paymentTransactionevent) => paymentTransactionevent.transaction
  )
  paymentTransactionevents: PaymentTransactionevent[];

  @ManyToOne(() => AppApp, (appApp) => appApp.paymentTransactionitems)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.paymentTransactionitems
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;

  @ManyToOne(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.paymentTransactionitems
  )
  @JoinColumn([{ name: "checkout_id", referencedColumnName: "token" }])
  checkout: CheckoutCheckout;

  @ManyToOne(
    () => OrderOrder,
    (orderOrder) => orderOrder.paymentTransactionitems
  )
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;
}
