import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PaymentPayment } from "./PaymentPayment";

@Index("payment_transaction_pkey", ["id"], { unique: true })
@Index("payment_transaction_payment_method_id_d35e75c1", ["paymentId"], {})
@Index("token_idx", ["token"], {})
@Entity("payment_transaction", { schema: "public" })
export class PaymentTransaction {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("character varying", { name: "token", length: 512 })
  token: string;

  @Column("character varying", { name: "kind", length: 25 })
  kind: string;

  @Column("boolean", { name: "is_success" })
  isSuccess: boolean;

  @Column("text", { name: "error", nullable: true })
  error: string | null;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("numeric", { name: "amount", precision: 12, scale: 3 })
  amount: string;

  @Column("jsonb", { name: "gateway_response" })
  gatewayResponse: object;

  @Column("integer", { name: "payment_id" })
  paymentId: number;

  @Column("character varying", {
    name: "customer_id",
    nullable: true,
    length: 256,
  })
  customerId: string | null;

  @Column("boolean", { name: "action_required" })
  actionRequired: boolean;

  @Column("jsonb", { name: "action_required_data" })
  actionRequiredData: object;

  @Column("boolean", { name: "already_processed" })
  alreadyProcessed: boolean;

  @ManyToOne(
    () => PaymentPayment,
    (paymentPayment) => paymentPayment.paymentTransactions
  )
  @JoinColumn([{ name: "payment_id", referencedColumnName: "id" }])
  payment: PaymentPayment;
}
