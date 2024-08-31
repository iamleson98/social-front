import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { DiscountOrderlinediscount } from "./DiscountOrderlinediscount";
import { OrderFulfillmentline } from "./OrderFulfillmentline";
import { OrderOrdergrantedrefundline } from "./OrderOrdergrantedrefundline";
import { TaxTaxclass } from "./TaxTaxclass";
import { ProductProductvariant } from "./ProductProductvariant";
import { OrderOrder } from "./OrderOrder";
import { ProductDigitalcontenturl } from "./ProductDigitalcontenturl";
import { WarehouseAllocation } from "./WarehouseAllocation";
import { WarehousePreorderallocation } from "./WarehousePreorderallocation";

@Index("order_orderline_token_47c4393d_pk", ["id"], { unique: true })
@Index("orderline_meta_idx", ["metadata"], {})
@Index("order_orderline_old_id_1da97079_uniq", ["oldId"], { unique: true })
@Index("order_orderline_order_token_id_c8d256ee", ["orderId"], {})
@Index("orderline_p_meta_idx", ["privateMetadata"], {})
@Index("order_orderline_tax_class_id_bc719d4f", ["taxClassId"], {})
@Index("order_orderline_variant_id_866774cb", ["variantId"], {})
@Entity("order_orderline", { schema: "public" })
export class OrderOrderline {
  @Column("character varying", { name: "product_name", length: 386 })
  productName: string;

  @Column("character varying", {
    name: "product_sku",
    nullable: true,
    length: 255,
  })
  productSku: string | null;

  @Column("integer", { name: "quantity" })
  quantity: number;

  @Column("numeric", { name: "unit_price_net_amount", precision: 12, scale: 3 })
  unitPriceNetAmount: string;

  @Column("numeric", {
    name: "unit_price_gross_amount",
    precision: 12,
    scale: 3,
  })
  unitPriceGrossAmount: string;

  @Column("boolean", { name: "is_shipping_required" })
  isShippingRequired: boolean;

  @Column("integer", { name: "quantity_fulfilled" })
  quantityFulfilled: number;

  @Column("integer", { name: "variant_id", nullable: true })
  variantId: number | null;

  @Column("numeric", {
    name: "tax_rate",
    nullable: true,
    precision: 5,
    scale: 4,
  })
  taxRate: string | null;

  @Column("character varying", { name: "translated_product_name", length: 386 })
  translatedProductName: string;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("character varying", { name: "translated_variant_name", length: 255 })
  translatedVariantName: string;

  @Column("character varying", { name: "variant_name", length: 255 })
  variantName: string;

  @Column("numeric", {
    name: "total_price_gross_amount",
    precision: 12,
    scale: 3,
  })
  totalPriceGrossAmount: string;

  @Column("numeric", {
    name: "total_price_net_amount",
    precision: 12,
    scale: 3,
  })
  totalPriceNetAmount: string;

  @Column("numeric", { name: "unit_discount_amount", precision: 12, scale: 3 })
  unitDiscountAmount: string;

  @Column("numeric", { name: "unit_discount_value", precision: 12, scale: 3 })
  unitDiscountValue: string;

  @Column("text", { name: "unit_discount_reason", nullable: true })
  unitDiscountReason: string | null;

  @Column("character varying", {
    name: "unit_discount_type",
    nullable: true,
    length: 10,
    default: () => "NULL::character varying",
  })
  unitDiscountType: string | null;

  @Column("numeric", {
    name: "undiscounted_total_price_gross_amount",
    precision: 12,
    scale: 3,
  })
  undiscountedTotalPriceGrossAmount: string;

  @Column("numeric", {
    name: "undiscounted_total_price_net_amount",
    precision: 12,
    scale: 3,
  })
  undiscountedTotalPriceNetAmount: string;

  @Column("numeric", {
    name: "undiscounted_unit_price_gross_amount",
    precision: 12,
    scale: 3,
  })
  undiscountedUnitPriceGrossAmount: string;

  @Column("numeric", {
    name: "undiscounted_unit_price_net_amount",
    precision: 12,
    scale: 3,
  })
  undiscountedUnitPriceNetAmount: string;

  @Column("boolean", { name: "is_gift_card" })
  isGiftCard: boolean;

  @Column("character varying", {
    name: "product_variant_id",
    nullable: true,
    length: 255,
  })
  productVariantId: string | null;

  @Column("character varying", { name: "sale_id", nullable: true, length: 255 })
  saleId: string | null;

  @Column("character varying", {
    name: "voucher_code",
    nullable: true,
    length: 255,
  })
  voucherCode: string | null;

  @Column("uuid", { name: "order_id" })
  orderId: string;

  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("integer", { name: "old_id", nullable: true, unique: true })
  oldId: number | null;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("numeric", {
    name: "base_unit_price_amount",
    precision: 12,
    scale: 3,
  })
  baseUnitPriceAmount: string;

  @Column("numeric", {
    name: "undiscounted_base_unit_price_amount",
    precision: 12,
    scale: 3,
  })
  undiscountedBaseUnitPriceAmount: string;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("integer", { name: "tax_class_id", nullable: true })
  taxClassId: number | null;

  @Column("jsonb", { name: "tax_class_metadata", nullable: true })
  taxClassMetadata: object | null;

  @Column("character varying", {
    name: "tax_class_name",
    nullable: true,
    length: 255,
  })
  taxClassName: string | null;

  @Column("jsonb", { name: "tax_class_private_metadata", nullable: true })
  taxClassPrivateMetadata: object | null;

  @Column("boolean", { name: "is_gift", default: () => "false" })
  isGift: boolean;

  @Column("boolean", { name: "is_price_overridden", nullable: true })
  isPriceOverridden: boolean | null;

  @OneToMany(
    () => DiscountOrderlinediscount,
    (discountOrderlinediscount) => discountOrderlinediscount.line
  )
  discountOrderlinediscounts: DiscountOrderlinediscount[];

  @OneToMany(
    () => OrderFulfillmentline,
    (orderFulfillmentline) => orderFulfillmentline.orderLine
  )
  orderFulfillmentlines: OrderFulfillmentline[];

  @OneToMany(
    () => OrderOrdergrantedrefundline,
    (orderOrdergrantedrefundline) => orderOrdergrantedrefundline.orderLine
  )
  orderOrdergrantedrefundlines: OrderOrdergrantedrefundline[];

  @ManyToOne(() => TaxTaxclass, (taxTaxclass) => taxTaxclass.orderOrderlines)
  @JoinColumn([{ name: "tax_class_id", referencedColumnName: "id" }])
  taxClass: TaxTaxclass;

  @ManyToOne(
    () => ProductProductvariant,
    (productProductvariant) => productProductvariant.orderOrderlines
  )
  @JoinColumn([{ name: "variant_id", referencedColumnName: "id" }])
  variant: ProductProductvariant;

  @ManyToOne(() => OrderOrder, (orderOrder) => orderOrder.orderOrderlines)
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;

  @OneToOne(
    () => ProductDigitalcontenturl,
    (productDigitalcontenturl) => productDigitalcontenturl.line
  )
  productDigitalcontenturl: ProductDigitalcontenturl;

  @OneToMany(
    () => WarehouseAllocation,
    (warehouseAllocation) => warehouseAllocation.orderLine
  )
  warehouseAllocations: WarehouseAllocation[];

  @OneToMany(
    () => WarehousePreorderallocation,
    (warehousePreorderallocation) => warehousePreorderallocation.orderLine
  )
  warehousePreorderallocations: WarehousePreorderallocation[];
}
