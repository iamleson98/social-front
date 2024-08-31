import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAssignedvariantattribute } from "./AttributeAssignedvariantattribute";
import { AttributeAttributevalue } from "./AttributeAttributevalue";
import { CheckoutCheckoutline } from "./CheckoutCheckoutline";
import { DiscountPromotionruleGifts } from "./DiscountPromotionruleGifts";
import { DiscountPromotionruleVariants } from "./DiscountPromotionruleVariants";
import { DiscountVoucherVariants } from "./DiscountVoucherVariants";
import { OrderOrderline } from "./OrderOrderline";
import { ProductDigitalcontent } from "./ProductDigitalcontent";
import { ProductProduct } from "./ProductProduct";
import { ProductProductvariantchannellisting } from "./ProductProductvariantchannellisting";
import { ProductProductvarianttranslation } from "./ProductProductvarianttranslation";
import { ProductVariantmedia } from "./ProductVariantmedia";
import { WarehouseStock } from "./WarehouseStock";

@Index("product_productvariant_created_355c17e4", ["createdAt"], {})
@Index(
  "product_productvariant_external_reference_8f7f4882_like",
  ["externalReference"],
  {}
)
@Index("product_productvariant_external_reference_key", ["externalReference"], {
  unique: true,
})
@Index("product_productvariant_pkey", ["id"], { unique: true })
@Index("productvariant_meta_idx", ["metadata"], {})
@Index("productvariant_p_meta_idx", ["privateMetadata"], {})
@Index("product_productvariant_product_id_43c5a310", ["productId"], {})
@Index("product_productvariant_sku_key", ["sku"], { unique: true })
@Index("product_productvariant_sku_50706818_like", ["sku"], {})
@Index("product_productvariant_sort_order_d4acf89b", ["sortOrder"], {})
@Index("product_productvariant_updated_at_4ed8c13c", ["updatedAt"], {})
@Entity("product_productvariant", { schema: "public" })
export class ProductProductvariant {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "sku",
    nullable: true,
    unique: true,
    length: 255,
  })
  sku: string | null;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("integer", { name: "product_id" })
  productId: number;

  @Column("boolean", { name: "track_inventory" })
  trackInventory: boolean;

  @Column("double precision", { name: "weight", nullable: true, precision: 53 })
  weight: number | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @Column("boolean", { name: "is_preorder" })
  isPreorder: boolean;

  @Column("timestamp with time zone", {
    name: "preorder_end_date",
    nullable: true,
  })
  preorderEndDate: Date | null;

  @Column("integer", { name: "preorder_global_threshold", nullable: true })
  preorderGlobalThreshold: number | null;

  @Column("integer", { name: "quantity_limit_per_customer", nullable: true })
  quantityLimitPerCustomer: number | null;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("character varying", {
    name: "external_reference",
    nullable: true,
    unique: true,
    length: 250,
  })
  externalReference: string | null;

  @OneToMany(
    () => AttributeAssignedvariantattribute,
    (attributeAssignedvariantattribute) =>
      attributeAssignedvariantattribute.variant
  )
  attributeAssignedvariantattributes: AttributeAssignedvariantattribute[];

  @OneToMany(
    () => AttributeAttributevalue,
    (attributeAttributevalue) => attributeAttributevalue.referenceVariant
  )
  attributeAttributevalues: AttributeAttributevalue[];

  @OneToMany(
    () => CheckoutCheckoutline,
    (checkoutCheckoutline) => checkoutCheckoutline.variant
  )
  checkoutCheckoutlines: CheckoutCheckoutline[];

  @OneToMany(
    () => DiscountPromotionruleGifts,
    (discountPromotionruleGifts) => discountPromotionruleGifts.productvariant
  )
  discountPromotionruleGifts: DiscountPromotionruleGifts[];

  @OneToMany(
    () => DiscountPromotionruleVariants,
    (discountPromotionruleVariants) =>
      discountPromotionruleVariants.productvariant
  )
  discountPromotionruleVariants: DiscountPromotionruleVariants[];

  @OneToMany(
    () => DiscountVoucherVariants,
    (discountVoucherVariants) => discountVoucherVariants.productvariant
  )
  discountVoucherVariants: DiscountVoucherVariants[];

  @OneToMany(() => OrderOrderline, (orderOrderline) => orderOrderline.variant)
  orderOrderlines: OrderOrderline[];

  @OneToOne(
    () => ProductDigitalcontent,
    (productDigitalcontent) => productDigitalcontent.productVariant
  )
  productDigitalcontent: ProductDigitalcontent;

  @OneToOne(
    () => ProductProduct,
    (productProduct) => productProduct.defaultVariant
  )
  productProduct: ProductProduct;

  @ManyToOne(
    () => ProductProduct,
    (productProduct) => productProduct.productProductvariants
  )
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: ProductProduct;

  @OneToMany(
    () => ProductProductvariantchannellisting,
    (productProductvariantchannellisting) =>
      productProductvariantchannellisting.variant
  )
  productProductvariantchannellistings: ProductProductvariantchannellisting[];

  @OneToMany(
    () => ProductProductvarianttranslation,
    (productProductvarianttranslation) =>
      productProductvarianttranslation.productVariant
  )
  productProductvarianttranslations: ProductProductvarianttranslation[];

  @OneToMany(
    () => ProductVariantmedia,
    (productVariantmedia) => productVariantmedia.variant
  )
  productVariantmedias: ProductVariantmedia[];

  @OneToMany(
    () => WarehouseStock,
    (warehouseStock) => warehouseStock.productVariant
  )
  warehouseStocks: WarehouseStock[];
}
