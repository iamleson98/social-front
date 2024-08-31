import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { AccountCustomerevent } from "./AccountCustomerevent";
import { DiscountOrderdiscount } from "./DiscountOrderdiscount";
import { GiftcardGiftcardevent } from "./GiftcardGiftcardevent";
import { InvoiceInvoice } from "./InvoiceInvoice";
import { InvoiceInvoiceevent } from "./InvoiceInvoiceevent";
import { OrderFulfillment } from "./OrderFulfillment";
import { AccountAddress } from "./AccountAddress";
import { ChannelChannel } from "./ChannelChannel";
import { WarehouseWarehouse } from "./WarehouseWarehouse";
import { ShippingShippingmethod } from "./ShippingShippingmethod";
import { TaxTaxclass } from "./TaxTaxclass";
import { AccountUser } from "./AccountUser";
import { DiscountVoucher } from "./DiscountVoucher";
import { OrderOrderGiftCards } from "./OrderOrderGiftCards";
import { OrderOrderevent } from "./OrderOrderevent";
import { OrderOrdergrantedrefund } from "./OrderOrdergrantedrefund";
import { OrderOrderline } from "./OrderOrderline";
import { PaymentPayment } from "./PaymentPayment";
import { PaymentTransactionitem } from "./PaymentTransactionitem";

@Index("order_order_authorize_status_3d7fd7b0", ["authorizeStatus"], {})
@Index("order_order_authorize_status_3d7fd7b0_like", ["authorizeStatus"], {})
@Index("order_order_billing_address_id_8fe537cf", ["billingAddressId"], {})
@Index("order_order_channel_id_4dacf8a4", ["channelId"], {})
@Index("order_order_charge_status_d96729ef_like", ["chargeStatus"], {})
@Index("order_order_charge_status_d96729ef", ["chargeStatus"], {})
@Index("checkout_token_btree_idx", ["checkoutToken"], {})
@Index("order_order_collection_point_id_0762767b", ["collectionPointId"], {})
@Index("idx_order_created_at", ["createdAt"], {})
@Index(
  "order_order_external_reference_8badbaae_like",
  ["externalReference"],
  {}
)
@Index("order_order_external_reference_key", ["externalReference"], {
  unique: true,
})
@Index("order_order_token_ddb7fb7b_pk", ["id"], { unique: true })
@Index("order_meta_idx", ["metadata"], {})
@Index("order_order_number_49f06f1b_uniq", ["number"], { unique: true })
@Index("order_order_original_token_id_f061b357", ["originalId"], {})
@Index("order_p_meta_idx", ["privateMetadata"], {})
@Index("order_search_gin", ["searchDocument"], {})
@Index("order_tsearch", ["searchVector"], {})
@Index("order_order_shipping_address_id_57e64931", ["shippingAddressId"], {})
@Index("order_order_shipping_method_id_2a742834", ["shippingMethodId"], {})
@Index("order_order_shipping_tax_class_id_ec0a5734", ["shippingTaxClassId"], {})
@Index("order_order_updated_at_6d31c2bd", ["updatedAt"], {})
@Index("order_email_search_gin", ["userEmail"], {})
@Index("order_user_email_user_id_idx", ["userEmail", "userId"], {})
@Index("order_order_user_id_7cf9bc2b", ["userId"], {})
@Index("order_voucher_code_idx", ["voucherCode"], {})
@Index("order_order_voucher_id_0748ca22", ["voucherId"], {})
@Entity("order_order", { schema: "public" })
export class OrderOrder {
  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("character varying", { name: "tracking_client_id", length: 36 })
  trackingClientId: string;

  @Column("character varying", { name: "user_email", length: 254 })
  userEmail: string;

  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("integer", { name: "billing_address_id", nullable: true })
  billingAddressId: number | null;

  @Column("integer", { name: "shipping_address_id", nullable: true })
  shippingAddressId: number | null;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("numeric", { name: "total_net_amount", precision: 12, scale: 3 })
  totalNetAmount: string;

  @Column("integer", { name: "voucher_id", nullable: true })
  voucherId: number | null;

  @Column("character varying", { name: "language_code", length: 35 })
  languageCode: string;

  @Column("numeric", {
    name: "shipping_price_gross_amount",
    precision: 12,
    scale: 3,
  })
  shippingPriceGrossAmount: string;

  @Column("numeric", { name: "total_gross_amount", precision: 12, scale: 3 })
  totalGrossAmount: string;

  @Column("numeric", {
    name: "shipping_price_net_amount",
    precision: 12,
    scale: 3,
  })
  shippingPriceNetAmount: string;

  @Column("character varying", { name: "status", length: 32 })
  status: string;

  @Column("character varying", {
    name: "shipping_method_name",
    nullable: true,
    length: 255,
  })
  shippingMethodName: string | null;

  @Column("integer", { name: "shipping_method_id", nullable: true })
  shippingMethodId: number | null;

  @Column("boolean", { name: "display_gross_prices" })
  displayGrossPrices: boolean;

  @Column("text", { name: "customer_note" })
  customerNote: string;

  @Column("double precision", { name: "weight", precision: 53 })
  weight: number;

  @Column("character varying", { name: "checkout_token", length: 36 })
  checkoutToken: string;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("integer", { name: "channel_id" })
  channelId: number;

  @Column("character varying", {
    name: "redirect_url",
    nullable: true,
    length: 200,
  })
  redirectUrl: string | null;

  @Column("numeric", {
    name: "shipping_tax_rate",
    nullable: true,
    precision: 5,
    scale: 4,
  })
  shippingTaxRate: string | null;

  @Column("numeric", {
    name: "undiscounted_total_gross_amount",
    precision: 12,
    scale: 3,
  })
  undiscountedTotalGrossAmount: string;

  @Column("numeric", {
    name: "undiscounted_total_net_amount",
    precision: 12,
    scale: 3,
  })
  undiscountedTotalNetAmount: string;

  @Column("numeric", { name: "total_charged_amount", precision: 12, scale: 3 })
  totalChargedAmount: string;

  @Column("character varying", { name: "origin", length: 32 })
  origin: string;

  @Column("uuid", { name: "collection_point_id", nullable: true })
  collectionPointId: string | null;

  @Column("character varying", {
    name: "collection_point_name",
    nullable: true,
    length: 255,
  })
  collectionPointName: string | null;

  @Column("text", { name: "search_document" })
  searchDocument: string;

  @Column("timestamp with time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("boolean", { name: "use_old_id" })
  useOldId: boolean;

  @Column("integer", { name: "number", unique: true })
  number: number;

  @Column("uuid", { name: "original_id", nullable: true })
  originalId: string | null;

  @Column("numeric", {
    name: "total_authorized_amount",
    precision: 12,
    scale: 3,
  })
  totalAuthorizedAmount: string;

  @Column("character varying", { name: "authorize_status", length: 32 })
  authorizeStatus: string;

  @Column("character varying", { name: "charge_status", length: 32 })
  chargeStatus: string;

  @Column("tsvector", { name: "search_vector", nullable: true })
  searchVector: string | null;

  @Column("boolean", { name: "should_refresh_prices" })
  shouldRefreshPrices: boolean;

  @Column("boolean", { name: "tax_exemption", default: () => "false" })
  taxExemption: boolean;

  @Column("numeric", {
    name: "base_shipping_price_amount",
    precision: 12,
    scale: 3,
  })
  baseShippingPriceAmount: string;

  @Column("integer", { name: "shipping_tax_class_id", nullable: true })
  shippingTaxClassId: number | null;

  @Column("jsonb", { name: "shipping_tax_class_metadata", nullable: true })
  shippingTaxClassMetadata: object | null;

  @Column("character varying", {
    name: "shipping_tax_class_name",
    nullable: true,
    length: 255,
  })
  shippingTaxClassName: string | null;

  @Column("jsonb", {
    name: "shipping_tax_class_private_metadata",
    nullable: true,
  })
  shippingTaxClassPrivateMetadata: object | null;

  @Column("character varying", {
    name: "external_reference",
    nullable: true,
    unique: true,
    length: 250,
  })
  externalReference: string | null;

  @Column("timestamp with time zone", { name: "expired_at", nullable: true })
  expiredAt: Date | null;

  @Column("character varying", {
    name: "voucher_code",
    nullable: true,
    length: 255,
  })
  voucherCode: string | null;

  @Column("numeric", {
    name: "subtotal_gross_amount",
    precision: 12,
    scale: 3,
    default: () => "0",
  })
  subtotalGrossAmount: string;

  @Column("numeric", {
    name: "subtotal_net_amount",
    precision: 12,
    scale: 3,
    default: () => "0",
  })
  subtotalNetAmount: string;

  @Column("character varying", {
    name: "tax_error",
    nullable: true,
    length: 255,
  })
  taxError: string | null;

  @Column("numeric", {
    name: "undiscounted_base_shipping_price_amount",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  undiscountedBaseShippingPriceAmount: string | null;

  @OneToMany(
    () => AccountCustomerevent,
    (accountCustomerevent) => accountCustomerevent.order
  )
  accountCustomerevents: AccountCustomerevent[];

  @OneToMany(
    () => DiscountOrderdiscount,
    (discountOrderdiscount) => discountOrderdiscount.order
  )
  discountOrderdiscounts: DiscountOrderdiscount[];

  @OneToMany(
    () => GiftcardGiftcardevent,
    (giftcardGiftcardevent) => giftcardGiftcardevent.order
  )
  giftcardGiftcardevents: GiftcardGiftcardevent[];

  @OneToMany(() => InvoiceInvoice, (invoiceInvoice) => invoiceInvoice.order)
  invoiceInvoices: InvoiceInvoice[];

  @OneToMany(
    () => InvoiceInvoiceevent,
    (invoiceInvoiceevent) => invoiceInvoiceevent.order
  )
  invoiceInvoiceevents: InvoiceInvoiceevent[];

  @OneToMany(
    () => OrderFulfillment,
    (orderFulfillment) => orderFulfillment.order
  )
  orderFulfillments: OrderFulfillment[];

  @ManyToOne(
    () => AccountAddress,
    (accountAddress) => accountAddress.orderOrders
  )
  @JoinColumn([{ name: "billing_address_id", referencedColumnName: "id" }])
  billingAddress: AccountAddress;

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.orderOrders
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @ManyToOne(
    () => WarehouseWarehouse,
    (warehouseWarehouse) => warehouseWarehouse.orderOrders
  )
  @JoinColumn([{ name: "collection_point_id", referencedColumnName: "id" }])
  collectionPoint: WarehouseWarehouse;

  @ManyToOne(
    () => AccountAddress,
    (accountAddress) => accountAddress.orderOrders2
  )
  @JoinColumn([{ name: "shipping_address_id", referencedColumnName: "id" }])
  shippingAddress: AccountAddress;

  @ManyToOne(
    () => ShippingShippingmethod,
    (shippingShippingmethod) => shippingShippingmethod.orderOrders
  )
  @JoinColumn([{ name: "shipping_method_id", referencedColumnName: "id" }])
  shippingMethod: ShippingShippingmethod;

  @ManyToOne(() => TaxTaxclass, (taxTaxclass) => taxTaxclass.orderOrders)
  @JoinColumn([{ name: "shipping_tax_class_id", referencedColumnName: "id" }])
  shippingTaxClass: TaxTaxclass;

  @ManyToOne(() => AccountUser, (accountUser) => accountUser.orderOrders)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;

  @ManyToOne(
    () => DiscountVoucher,
    (discountVoucher) => discountVoucher.orderOrders
  )
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: DiscountVoucher;

  @ManyToOne(() => OrderOrder, (orderOrder) => orderOrder.orderOrders)
  @JoinColumn([{ name: "original_id", referencedColumnName: "id" }])
  original: OrderOrder;

  @OneToMany(() => OrderOrder, (orderOrder) => orderOrder.original)
  orderOrders: OrderOrder[];

  @OneToMany(
    () => OrderOrderGiftCards,
    (orderOrderGiftCards) => orderOrderGiftCards.order
  )
  orderOrderGiftCards: OrderOrderGiftCards[];

  @OneToMany(() => OrderOrderevent, (orderOrderevent) => orderOrderevent.order)
  orderOrderevents: OrderOrderevent[];

  @OneToMany(
    () => OrderOrdergrantedrefund,
    (orderOrdergrantedrefund) => orderOrdergrantedrefund.order
  )
  orderOrdergrantedrefunds: OrderOrdergrantedrefund[];

  @OneToMany(() => OrderOrderline, (orderOrderline) => orderOrderline.order)
  orderOrderlines: OrderOrderline[];

  @OneToMany(() => PaymentPayment, (paymentPayment) => paymentPayment.order)
  paymentPayments: PaymentPayment[];

  @OneToMany(
    () => PaymentTransactionitem,
    (paymentTransactionitem) => paymentTransactionitem.order
  )
  paymentTransactionitems: PaymentTransactionitem[];
}
