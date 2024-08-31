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
import { ShippingShippingzone } from "./ShippingShippingzone";
import { TaxTaxclass } from "./TaxTaxclass";
import { ShippingShippingmethodExcludedProducts } from "./ShippingShippingmethodExcludedProducts";
import { ShippingShippingmethodchannellisting } from "./ShippingShippingmethodchannellisting";
import { ShippingShippingmethodpostalcoderule } from "./ShippingShippingmethodpostalcoderule";
import { ShippingShippingmethodtranslation } from "./ShippingShippingmethodtranslation";

@Index("shipping_shippingmethod_pkey", ["id"], { unique: true })
@Index("shippingmethod_meta_idx", ["metadata"], {})
@Index("shippingmethod_p_meta_idx", ["privateMetadata"], {})
@Index(
  "shipping_shippingmethod_shipping_zone_id_265b7413",
  ["shippingZoneId"],
  {}
)
@Index("shipping_shippingmethod_tax_class_id_59ec5c19", ["taxClassId"], {})
@Entity("shipping_shippingmethod", { schema: "public" })
export class ShippingShippingmethod {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 100 })
  name: string;

  @Column("double precision", {
    name: "maximum_order_weight",
    nullable: true,
    precision: 53,
  })
  maximumOrderWeight: number | null;

  @Column("double precision", {
    name: "minimum_order_weight",
    nullable: true,
    precision: 53,
  })
  minimumOrderWeight: number | null;

  @Column("character varying", { name: "type", length: 30 })
  type: string;

  @Column("integer", { name: "shipping_zone_id" })
  shippingZoneId: number;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("integer", { name: "maximum_delivery_days", nullable: true })
  maximumDeliveryDays: number | null;

  @Column("integer", { name: "minimum_delivery_days", nullable: true })
  minimumDeliveryDays: number | null;

  @Column("jsonb", { name: "description", nullable: true })
  description: object | null;

  @Column("integer", { name: "tax_class_id", nullable: true })
  taxClassId: number | null;

  @OneToMany(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.shippingMethod
  )
  checkoutCheckouts: CheckoutCheckout[];

  @OneToMany(() => OrderOrder, (orderOrder) => orderOrder.shippingMethod)
  orderOrders: OrderOrder[];

  @ManyToOne(
    () => ShippingShippingzone,
    (shippingShippingzone) => shippingShippingzone.shippingShippingmethods
  )
  @JoinColumn([{ name: "shipping_zone_id", referencedColumnName: "id" }])
  shippingZone: ShippingShippingzone;

  @ManyToOne(
    () => TaxTaxclass,
    (taxTaxclass) => taxTaxclass.shippingShippingmethods
  )
  @JoinColumn([{ name: "tax_class_id", referencedColumnName: "id" }])
  taxClass: TaxTaxclass;

  @OneToMany(
    () => ShippingShippingmethodExcludedProducts,
    (shippingShippingmethodExcludedProducts) =>
      shippingShippingmethodExcludedProducts.shippingmethod
  )
  shippingShippingmethodExcludedProducts: ShippingShippingmethodExcludedProducts[];

  @OneToMany(
    () => ShippingShippingmethodchannellisting,
    (shippingShippingmethodchannellisting) =>
      shippingShippingmethodchannellisting.shippingMethod
  )
  shippingShippingmethodchannellistings: ShippingShippingmethodchannellisting[];

  @OneToMany(
    () => ShippingShippingmethodpostalcoderule,
    (shippingShippingmethodpostalcoderule) =>
      shippingShippingmethodpostalcoderule.shippingMethod
  )
  shippingShippingmethodpostalcoderules: ShippingShippingmethodpostalcoderule[];

  @OneToMany(
    () => ShippingShippingmethodtranslation,
    (shippingShippingmethodtranslation) =>
      shippingShippingmethodtranslation.shippingMethod
  )
  shippingShippingmethodtranslations: ShippingShippingmethodtranslation[];
}
