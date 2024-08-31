import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DiscountCheckoutdiscount } from "./DiscountCheckoutdiscount";
import { DiscountCheckoutlinediscount } from "./DiscountCheckoutlinediscount";
import { DiscountOrderdiscount } from "./DiscountOrderdiscount";
import { DiscountOrderlinediscount } from "./DiscountOrderlinediscount";
import { DiscountVoucherCategories } from "./DiscountVoucherCategories";
import { DiscountVoucherCollections } from "./DiscountVoucherCollections";
import { DiscountVoucherProducts } from "./DiscountVoucherProducts";
import { DiscountVoucherVariants } from "./DiscountVoucherVariants";
import { DiscountVoucherchannellisting } from "./DiscountVoucherchannellisting";
import { DiscountVouchercode } from "./DiscountVouchercode";
import { DiscountVouchertranslation } from "./DiscountVouchertranslation";
import { OrderOrder } from "./OrderOrder";

@Index("discount_voucher_pkey", ["id"], { unique: true })
@Entity("discount_voucher", { schema: "public" })
export class DiscountVoucher {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "type", length: 20 })
  type: string;

  @Column("character varying", { name: "name", nullable: true, length: 255 })
  name: string | null;

  @Column("integer", { name: "usage_limit", nullable: true })
  usageLimit: number | null;

  @Column("timestamp with time zone", { name: "start_date" })
  startDate: Date;

  @Column("timestamp with time zone", { name: "end_date", nullable: true })
  endDate: Date | null;

  @Column("character varying", { name: "discount_value_type", length: 10 })
  discountValueType: string;

  @Column("boolean", { name: "apply_once_per_order" })
  applyOncePerOrder: boolean;

  @Column("character varying", { name: "countries", length: 749 })
  countries: string;

  @Column("integer", { name: "min_checkout_items_quantity", nullable: true })
  minCheckoutItemsQuantity: number | null;

  @Column("boolean", { name: "apply_once_per_customer" })
  applyOncePerCustomer: boolean;

  @Column("boolean", { name: "only_for_staff" })
  onlyForStaff: boolean;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("boolean", { name: "single_use", default: () => "false" })
  singleUse: boolean;

  @OneToMany(
    () => DiscountCheckoutdiscount,
    (discountCheckoutdiscount) => discountCheckoutdiscount.voucher
  )
  discountCheckoutdiscounts: DiscountCheckoutdiscount[];

  @OneToMany(
    () => DiscountCheckoutlinediscount,
    (discountCheckoutlinediscount) => discountCheckoutlinediscount.voucher
  )
  discountCheckoutlinediscounts: DiscountCheckoutlinediscount[];

  @OneToMany(
    () => DiscountOrderdiscount,
    (discountOrderdiscount) => discountOrderdiscount.voucher
  )
  discountOrderdiscounts: DiscountOrderdiscount[];

  @OneToMany(
    () => DiscountOrderlinediscount,
    (discountOrderlinediscount) => discountOrderlinediscount.voucher
  )
  discountOrderlinediscounts: DiscountOrderlinediscount[];

  @OneToMany(
    () => DiscountVoucherCategories,
    (discountVoucherCategories) => discountVoucherCategories.voucher
  )
  discountVoucherCategories: DiscountVoucherCategories[];

  @OneToMany(
    () => DiscountVoucherCollections,
    (discountVoucherCollections) => discountVoucherCollections.voucher
  )
  discountVoucherCollections: DiscountVoucherCollections[];

  @OneToMany(
    () => DiscountVoucherProducts,
    (discountVoucherProducts) => discountVoucherProducts.voucher
  )
  discountVoucherProducts: DiscountVoucherProducts[];

  @OneToMany(
    () => DiscountVoucherVariants,
    (discountVoucherVariants) => discountVoucherVariants.voucher
  )
  discountVoucherVariants: DiscountVoucherVariants[];

  @OneToMany(
    () => DiscountVoucherchannellisting,
    (discountVoucherchannellisting) => discountVoucherchannellisting.voucher
  )
  discountVoucherchannellistings: DiscountVoucherchannellisting[];

  @OneToMany(
    () => DiscountVouchercode,
    (discountVouchercode) => discountVouchercode.voucher
  )
  discountVouchercodes: DiscountVouchercode[];

  @OneToMany(
    () => DiscountVouchertranslation,
    (discountVouchertranslation) => discountVouchertranslation.voucher
  )
  discountVouchertranslations: DiscountVouchertranslation[];

  @OneToMany(() => OrderOrder, (orderOrder) => orderOrder.voucher)
  orderOrders: OrderOrder[];
}
