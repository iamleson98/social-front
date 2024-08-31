import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { AccountAddress } from "./AccountAddress";
import { ChannelChannel } from "./ChannelChannel";
import { WarehouseWarehouse } from "./WarehouseWarehouse";
import { ShippingShippingmethod } from "./ShippingShippingmethod";
import { AccountUser } from "./AccountUser";
import { CheckoutCheckoutGiftCards } from "./CheckoutCheckoutGiftCards";
import { CheckoutCheckoutline } from "./CheckoutCheckoutline";
import { CheckoutCheckoutmetadata } from "./CheckoutCheckoutmetadata";
import { DiscountCheckoutdiscount } from "./DiscountCheckoutdiscount";
import { PaymentPayment } from "./PaymentPayment";
import { PaymentTransactionitem } from "./PaymentTransactionitem";

@Index("checkout_checkout_authorize_status_27351893", ["authorizeStatus"], {})
@Index(
  "checkout_checkout_authorize_status_27351893_like",
  ["authorizeStatus"],
  {}
)
@Index("cart_cart_billing_address_id_9eb62ddd", ["billingAddressId"], {})
@Index("checkout_checkout_channel_id_3b1a1e12", ["channelId"], {})
@Index("checkout_checkout_charge_status_bd143b33_like", ["chargeStatus"], {})
@Index("checkout_checkout_charge_status_bd143b33", ["chargeStatus"], {})
@Index(
  "checkout_checkout_collection_point_id_2dfc8e33",
  ["collectionPointId"],
  {}
)
@Index("checkout_checkout_last_change_dfde0b31", ["lastChange"], {})
@Index("checkout_meta_idx", ["metadata"], {})
@Index("checkout_p_meta_idx", ["privateMetadata"], {})
@Index("cart_cart_shipping_address_id_adfddaf9", ["shippingAddressId"], {})
@Index("cart_cart_shipping_method_id_835c02e0", ["shippingMethodId"], {})
@Index("cart_cart_pkey", ["token"], { unique: true })
@Index("cart_cart_user_id_9b4220b9", ["userId"], {})
@Entity("checkout_checkout", { schema: "public" })
export class CheckoutCheckout {
  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "last_change" })
  lastChange: Date;

  @Column("character varying", { name: "email", nullable: true, length: 254 })
  email: string | null;

  @Column("uuid", { primary: true, name: "token" })
  token: string;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("integer", { name: "billing_address_id", nullable: true })
  billingAddressId: number | null;

  @Column("numeric", { name: "discount_amount", precision: 12, scale: 3 })
  discountAmount: string;

  @Column("character varying", {
    name: "discount_name",
    nullable: true,
    length: 255,
  })
  discountName: string | null;

  @Column("text", { name: "note" })
  note: string;

  @Column("integer", { name: "shipping_address_id", nullable: true })
  shippingAddressId: number | null;

  @Column("integer", { name: "shipping_method_id", nullable: true })
  shippingMethodId: number | null;

  @Column("character varying", {
    name: "voucher_code",
    nullable: true,
    length: 255,
  })
  voucherCode: string | null;

  @Column("character varying", {
    name: "translated_discount_name",
    nullable: true,
    length: 255,
  })
  translatedDiscountName: string | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("character varying", { name: "country", length: 2 })
  country: string;

  @Column("character varying", {
    name: "redirect_url",
    nullable: true,
    length: 200,
  })
  redirectUrl: string | null;

  @Column("character varying", {
    name: "tracking_code",
    nullable: true,
    length: 255,
  })
  trackingCode: string | null;

  @Column("integer", { name: "channel_id" })
  channelId: number;

  @Column("character varying", { name: "language_code", length: 35 })
  languageCode: string;

  @Column("uuid", { name: "collection_point_id", nullable: true })
  collectionPointId: string | null;

  @Column("timestamp with time zone", { name: "price_expiration" })
  priceExpiration: Date;

  @Column("numeric", {
    name: "shipping_price_gross_amount",
    precision: 12,
    scale: 3,
  })
  shippingPriceGrossAmount: string;

  @Column("numeric", {
    name: "shipping_price_net_amount",
    precision: 12,
    scale: 3,
  })
  shippingPriceNetAmount: string;

  @Column("numeric", { name: "shipping_tax_rate", precision: 5, scale: 4 })
  shippingTaxRate: string;

  @Column("numeric", { name: "subtotal_gross_amount", precision: 12, scale: 3 })
  subtotalGrossAmount: string;

  @Column("numeric", { name: "subtotal_net_amount", precision: 12, scale: 3 })
  subtotalNetAmount: string;

  @Column("numeric", { name: "total_gross_amount", precision: 12, scale: 3 })
  totalGrossAmount: string;

  @Column("numeric", { name: "total_net_amount", precision: 12, scale: 3 })
  totalNetAmount: string;

  @Column("boolean", { name: "tax_exemption", default: () => "false" })
  taxExemption: boolean;

  @Column("character varying", {
    name: "authorize_status",
    length: 32,
    default: () => "'none'",
  })
  authorizeStatus: string;

  @Column("character varying", {
    name: "charge_status",
    length: 32,
    default: () => "'none'",
  })
  chargeStatus: string;

  @Column("timestamp with time zone", {
    name: "last_transaction_modified_at",
    nullable: true,
  })
  lastTransactionModifiedAt: Date | null;

  @Column("boolean", {
    name: "automatically_refundable",
    default: () => "false",
  })
  automaticallyRefundable: boolean;

  @Column("numeric", {
    name: "base_subtotal_amount",
    precision: 12,
    scale: 3,
    default: () => "0",
  })
  baseSubtotalAmount: string;

  @Column("numeric", {
    name: "base_total_amount",
    precision: 12,
    scale: 3,
    default: () => "0",
  })
  baseTotalAmount: string;

  @Column("character varying", {
    name: "tax_error",
    nullable: true,
    length: 255,
  })
  taxError: string | null;

  @Column("boolean", {
    name: "is_voucher_usage_increased",
    default: () => "false",
  })
  isVoucherUsageIncreased: boolean;

  @Column("timestamp with time zone", {
    name: "completing_started_at",
    nullable: true,
  })
  completingStartedAt: Date | null;

  @ManyToOne(
    () => AccountAddress,
    (accountAddress) => accountAddress.checkoutCheckouts
  )
  @JoinColumn([{ name: "billing_address_id", referencedColumnName: "id" }])
  billingAddress: AccountAddress;

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.checkoutCheckouts
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @ManyToOne(
    () => WarehouseWarehouse,
    (warehouseWarehouse) => warehouseWarehouse.checkoutCheckouts
  )
  @JoinColumn([{ name: "collection_point_id", referencedColumnName: "id" }])
  collectionPoint: WarehouseWarehouse;

  @ManyToOne(
    () => AccountAddress,
    (accountAddress) => accountAddress.checkoutCheckouts2
  )
  @JoinColumn([{ name: "shipping_address_id", referencedColumnName: "id" }])
  shippingAddress: AccountAddress;

  @ManyToOne(
    () => ShippingShippingmethod,
    (shippingShippingmethod) => shippingShippingmethod.checkoutCheckouts
  )
  @JoinColumn([{ name: "shipping_method_id", referencedColumnName: "id" }])
  shippingMethod: ShippingShippingmethod;

  @ManyToOne(() => AccountUser, (accountUser) => accountUser.checkoutCheckouts)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;

  @OneToMany(
    () => CheckoutCheckoutGiftCards,
    (checkoutCheckoutGiftCards) => checkoutCheckoutGiftCards.checkout
  )
  checkoutCheckoutGiftCards: CheckoutCheckoutGiftCards[];

  @OneToMany(
    () => CheckoutCheckoutline,
    (checkoutCheckoutline) => checkoutCheckoutline.checkout
  )
  checkoutCheckoutlines: CheckoutCheckoutline[];

  @OneToOne(
    () => CheckoutCheckoutmetadata,
    (checkoutCheckoutmetadata) => checkoutCheckoutmetadata.checkout
  )
  checkoutCheckoutmetadata: CheckoutCheckoutmetadata;

  @OneToMany(
    () => DiscountCheckoutdiscount,
    (discountCheckoutdiscount) => discountCheckoutdiscount.checkout
  )
  discountCheckoutdiscounts: DiscountCheckoutdiscount[];

  @OneToMany(() => PaymentPayment, (paymentPayment) => paymentPayment.checkout)
  paymentPayments: PaymentPayment[];

  @OneToMany(
    () => PaymentTransactionitem,
    (paymentTransactionitem) => paymentTransactionitem.checkout
  )
  paymentTransactionitems: PaymentTransactionitem[];
}
