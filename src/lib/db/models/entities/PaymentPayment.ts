import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CheckoutCheckout } from "./CheckoutCheckout";
import { OrderOrder } from "./OrderOrder";
import { PaymentTransaction } from "./PaymentTransaction";

@Index("payment_paymentmethod_checkout_id_5c0aae3d", ["checkoutId"], {})
@Index("payment_paymentmethod_pkey", ["id"], { unique: true })
@Index("payment_meta_idx", ["metadata"], {})
@Index("payment_payment_order_token_id_6823f402", ["orderId"], {})
@Index("payment_p_meta_idx", ["privateMetadata"], {})
@Index("payment_payment_psp_reference_720e9ba9", ["pspReference"], {})
@Index("payment_payment_psp_reference_720e9ba9_like", ["pspReference"], {})
@Entity("payment_payment", { schema: "public" })
export class PaymentPayment {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "gateway", length: 255 })
  gateway: string;

  @Column("boolean", { name: "is_active" })
  isActive: boolean;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "modified_at" })
  modifiedAt: Date;

  @Column("character varying", { name: "charge_status", length: 20 })
  chargeStatus: string;

  @Column("character varying", { name: "billing_first_name", length: 256 })
  billingFirstName: string;

  @Column("character varying", { name: "billing_last_name", length: 256 })
  billingLastName: string;

  @Column("character varying", { name: "billing_company_name", length: 256 })
  billingCompanyName: string;

  @Column("character varying", { name: "billing_address_1", length: 256 })
  billingAddress_1: string;

  @Column("character varying", { name: "billing_address_2", length: 256 })
  billingAddress_2: string;

  @Column("character varying", { name: "billing_city", length: 256 })
  billingCity: string;

  @Column("character varying", { name: "billing_city_area", length: 128 })
  billingCityArea: string;

  @Column("character varying", { name: "billing_postal_code", length: 256 })
  billingPostalCode: string;

  @Column("character varying", { name: "billing_country_code", length: 2 })
  billingCountryCode: string;

  @Column("character varying", { name: "billing_country_area", length: 256 })
  billingCountryArea: string;

  @Column("character varying", { name: "billing_email", length: 254 })
  billingEmail: string;

  @Column("inet", { name: "customer_ip_address", nullable: true })
  customerIpAddress: string | null;

  @Column("character varying", { name: "cc_brand", length: 40 })
  ccBrand: string;

  @Column("integer", { name: "cc_exp_month", nullable: true })
  ccExpMonth: number | null;

  @Column("integer", { name: "cc_exp_year", nullable: true })
  ccExpYear: number | null;

  @Column("character varying", { name: "cc_first_digits", length: 6 })
  ccFirstDigits: string;

  @Column("character varying", { name: "cc_last_digits", length: 4 })
  ccLastDigits: string;

  @Column("text", { name: "extra_data" })
  extraData: string;

  @Column("character varying", { name: "token", length: 512 })
  token: string;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("numeric", { name: "total", precision: 12, scale: 3 })
  total: string;

  @Column("numeric", { name: "captured_amount", precision: 12, scale: 3 })
  capturedAmount: string;

  @Column("uuid", { name: "checkout_id", nullable: true })
  checkoutId: string | null;

  @Column("boolean", { name: "to_confirm" })
  toConfirm: boolean;

  @Column("character varying", { name: "payment_method_type", length: 256 })
  paymentMethodType: string;

  @Column("character varying", {
    name: "return_url",
    nullable: true,
    length: 200,
  })
  returnUrl: string | null;

  @Column("character varying", {
    name: "psp_reference",
    nullable: true,
    length: 512,
  })
  pspReference: string | null;

  @Column("boolean", { name: "partial" })
  partial: boolean;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("character varying", { name: "store_payment_method", length: 11 })
  storePaymentMethod: string;

  @Column("uuid", { name: "order_id", nullable: true })
  orderId: string | null;

  @ManyToOne(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.paymentPayments
  )
  @JoinColumn([{ name: "checkout_id", referencedColumnName: "token" }])
  checkout: CheckoutCheckout;

  @ManyToOne(() => OrderOrder, (orderOrder) => orderOrder.paymentPayments)
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;

  @OneToMany(
    () => PaymentTransaction,
    (paymentTransaction) => paymentTransaction.payment
  )
  paymentTransactions: PaymentTransaction[];
}
