import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountGroupChannels } from "./AccountGroupChannels";
import { CheckoutCheckout } from "./CheckoutCheckout";
import { DiscountPromotionruleChannels } from "./DiscountPromotionruleChannels";
import { DiscountVoucherchannellisting } from "./DiscountVoucherchannellisting";
import { OrderOrder } from "./OrderOrder";
import { PluginsPluginconfiguration } from "./PluginsPluginconfiguration";
import { ProductCollectionchannellisting } from "./ProductCollectionchannellisting";
import { ProductProductchannellisting } from "./ProductProductchannellisting";
import { ProductProductvariantchannellisting } from "./ProductProductvariantchannellisting";
import { ShippingShippingmethodchannellisting } from "./ShippingShippingmethodchannellisting";
import { ShippingShippingzoneChannels } from "./ShippingShippingzoneChannels";
import { TaxTaxconfiguration } from "./TaxTaxconfiguration";
import { WarehouseChannelwarehouse } from "./WarehouseChannelwarehouse";

@Index("channel_channel_pkey", ["id"], { unique: true })
@Index("channel_meta_idx", ["metadata"], {})
@Index("channel_p_meta_idx", ["privateMetadata"], {})
@Index("channel_channel_slug_91801cbf_like", ["slug"], {})
@Index("channel_channel_slug_key", ["slug"], { unique: true })
@Entity("channel_channel", { schema: "public" })
export class ChannelChannel {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 250 })
  name: string;

  @Column("character varying", { name: "slug", unique: true, length: 255 })
  slug: string;

  @Column("boolean", { name: "is_active" })
  isActive: boolean;

  @Column("character varying", { name: "currency_code", length: 3 })
  currencyCode: string;

  @Column("character varying", { name: "default_country", length: 2 })
  defaultCountry: string;

  @Column("character varying", { name: "allocation_strategy", length: 255 })
  allocationStrategy: string;

  @Column("boolean", {
    name: "automatically_confirm_all_new_orders",
    nullable: true,
  })
  automaticallyConfirmAllNewOrders: boolean | null;

  @Column("boolean", {
    name: "automatically_fulfill_non_shippable_gift_card",
    nullable: true,
  })
  automaticallyFulfillNonShippableGiftCard: boolean | null;

  @Column("character varying", {
    name: "order_mark_as_paid_strategy",
    length: 255,
    default: () => "'payment_flow'",
  })
  orderMarkAsPaidStrategy: string;

  @Column("character varying", {
    name: "default_transaction_flow_strategy",
    length: 255,
    default: () => "'charge'",
  })
  defaultTransactionFlowStrategy: string;

  @Column("integer", { name: "expire_orders_after", nullable: true })
  expireOrdersAfter: number | null;

  @Column("interval", {
    name: "delete_expired_orders_after",
    default: () => "'60 days'",
  })
  deleteExpiredOrdersAfter: any;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("boolean", { name: "allow_unpaid_orders", default: () => "false" })
  allowUnpaidOrders: boolean;

  @Column("boolean", {
    name: "use_legacy_error_flow_for_checkout",
    default: () => "true",
  })
  useLegacyErrorFlowForCheckout: boolean;

  @Column("boolean", {
    name: "include_draft_order_in_voucher_usage",
    default: () => "false",
  })
  includeDraftOrderInVoucherUsage: boolean;

  @OneToMany(
    () => AccountGroupChannels,
    (accountGroupChannels) => accountGroupChannels.channel
  )
  accountGroupChannels: AccountGroupChannels[];

  @OneToMany(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.channel
  )
  checkoutCheckouts: CheckoutCheckout[];

  @OneToMany(
    () => DiscountPromotionruleChannels,
    (discountPromotionruleChannels) => discountPromotionruleChannels.channel
  )
  discountPromotionruleChannels: DiscountPromotionruleChannels[];

  @OneToMany(
    () => DiscountVoucherchannellisting,
    (discountVoucherchannellisting) => discountVoucherchannellisting.channel
  )
  discountVoucherchannellistings: DiscountVoucherchannellisting[];

  @OneToMany(() => OrderOrder, (orderOrder) => orderOrder.channel)
  orderOrders: OrderOrder[];

  @OneToMany(
    () => PluginsPluginconfiguration,
    (pluginsPluginconfiguration) => pluginsPluginconfiguration.channel
  )
  pluginsPluginconfigurations: PluginsPluginconfiguration[];

  @OneToMany(
    () => ProductCollectionchannellisting,
    (productCollectionchannellisting) => productCollectionchannellisting.channel
  )
  productCollectionchannellistings: ProductCollectionchannellisting[];

  @OneToMany(
    () => ProductProductchannellisting,
    (productProductchannellisting) => productProductchannellisting.channel
  )
  productProductchannellistings: ProductProductchannellisting[];

  @OneToMany(
    () => ProductProductvariantchannellisting,
    (productProductvariantchannellisting) =>
      productProductvariantchannellisting.channel
  )
  productProductvariantchannellistings: ProductProductvariantchannellisting[];

  @OneToMany(
    () => ShippingShippingmethodchannellisting,
    (shippingShippingmethodchannellisting) =>
      shippingShippingmethodchannellisting.channel
  )
  shippingShippingmethodchannellistings: ShippingShippingmethodchannellisting[];

  @OneToMany(
    () => ShippingShippingzoneChannels,
    (shippingShippingzoneChannels) => shippingShippingzoneChannels.channel
  )
  shippingShippingzoneChannels: ShippingShippingzoneChannels[];

  @OneToOne(
    () => TaxTaxconfiguration,
    (taxTaxconfiguration) => taxTaxconfiguration.channel
  )
  taxTaxconfiguration: TaxTaxconfiguration;

  @OneToMany(
    () => WarehouseChannelwarehouse,
    (warehouseChannelwarehouse) => warehouseChannelwarehouse.channel
  )
  warehouseChannelwarehouses: WarehouseChannelwarehouse[];
}
