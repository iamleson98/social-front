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
import { AttributeAssignedproductattributevalue } from "./AttributeAssignedproductattributevalue";
import { AttributeAttributevalue } from "./AttributeAttributevalue";
import { DiscountVoucherProducts } from "./DiscountVoucherProducts";
import { GiftcardGiftcard } from "./GiftcardGiftcard";
import { ProductCollectionproduct } from "./ProductCollectionproduct";
import { ProductCategory } from "./ProductCategory";
import { ProductProductvariant } from "./ProductProductvariant";
import { ProductProducttype } from "./ProductProducttype";
import { TaxTaxclass } from "./TaxTaxclass";
import { ProductProductchannellisting } from "./ProductProductchannellisting";
import { ProductProductmedia } from "./ProductProductmedia";
import { ProductProducttranslation } from "./ProductProducttranslation";
import { ShippingShippingmethodExcludedProducts } from "./ShippingShippingmethodExcludedProducts";

@Index("product_pro_categor_8de99d_idx", ["categoryId", "slug"], {})
@Index("product_product_category_id_0c725779", ["categoryId"], {})
@Index("product_product_created_526af21d", ["createdAt"], {})
@Index("product_product_default_variant_id_key", ["defaultVariantId"], {
  unique: true,
})
@Index("product_product_external_reference_key", ["externalReference"], {
  unique: true,
})
@Index(
  "product_product_external_reference_af10ae04_like",
  ["externalReference"],
  {}
)
@Index("product_product_pkey", ["id"], { unique: true })
@Index("product_meta_idx", ["metadata"], {})
@Index("product_gin", ["name", "slug"], {})
@Index("product_p_meta_idx", ["privateMetadata"], {})
@Index("product_product_product_class_id_0547c998", ["productTypeId"], {})
@Index("product_search_gin", ["searchDocument"], {})
@Index("product_product_search_index_dirty_724d006b", ["searchIndexDirty"], {})
@Index("product_tsearch", ["searchVector"], {})
@Index("product_product_slug_key", ["slug"], { unique: true })
@Index("product_product_slug_76cde0ae_like", ["slug"], {})
@Index("product_product_tax_class_id_a0476487", ["taxClassId"], {})
@Index("product_product_updated_at_0eb084a6", ["updatedAt"], {})
@Entity("product_product", { schema: "public" })
export class ProductProduct {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 250 })
  name: string;

  @Column("jsonb", { name: "description", nullable: true })
  description: object | null;

  @Column("timestamp with time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("integer", { name: "product_type_id" })
  productTypeId: number;

  @Column("integer", { name: "category_id", nullable: true })
  categoryId: number | null;

  @Column("character varying", {
    name: "seo_description",
    nullable: true,
    length: 300,
  })
  seoDescription: string | null;

  @Column("character varying", {
    name: "seo_title",
    nullable: true,
    length: 70,
  })
  seoTitle: string | null;

  @Column("double precision", { name: "weight", nullable: true, precision: 53 })
  weight: number | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("character varying", { name: "slug", unique: true, length: 255 })
  slug: string;

  @Column("integer", {
    name: "default_variant_id",
    nullable: true,
    unique: true,
  })
  defaultVariantId: number | null;

  @Column("text", { name: "description_plaintext" })
  descriptionPlaintext: string;

  @Column("double precision", { name: "rating", nullable: true, precision: 53 })
  rating: number | null;

  @Column("text", { name: "search_document" })
  searchDocument: string;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("tsvector", { name: "search_vector", nullable: true })
  searchVector: string | null;

  @Column("boolean", { name: "search_index_dirty" })
  searchIndexDirty: boolean;

  @Column("integer", { name: "tax_class_id", nullable: true })
  taxClassId: number | null;

  @Column("character varying", {
    name: "external_reference",
    nullable: true,
    unique: true,
    length: 250,
  })
  externalReference: string | null;

  @OneToMany(
    () => AttributeAssignedproductattributevalue,
    (attributeAssignedproductattributevalue) =>
      attributeAssignedproductattributevalue.product
  )
  attributeAssignedproductattributevalues: AttributeAssignedproductattributevalue[];

  @OneToMany(
    () => AttributeAttributevalue,
    (attributeAttributevalue) => attributeAttributevalue.referenceProduct
  )
  attributeAttributevalues: AttributeAttributevalue[];

  @OneToMany(
    () => DiscountVoucherProducts,
    (discountVoucherProducts) => discountVoucherProducts.product
  )
  discountVoucherProducts: DiscountVoucherProducts[];

  @OneToMany(
    () => GiftcardGiftcard,
    (giftcardGiftcard) => giftcardGiftcard.product
  )
  giftcardGiftcards: GiftcardGiftcard[];

  @OneToMany(
    () => ProductCollectionproduct,
    (productCollectionproduct) => productCollectionproduct.product
  )
  productCollectionproducts: ProductCollectionproduct[];

  @ManyToOne(
    () => ProductCategory,
    (productCategory) => productCategory.productProducts
  )
  @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
  category: ProductCategory;

  @OneToOne(
    () => ProductProductvariant,
    (productProductvariant) => productProductvariant.productProduct
  )
  @JoinColumn([{ name: "default_variant_id", referencedColumnName: "id" }])
  defaultVariant: ProductProductvariant;

  @ManyToOne(
    () => ProductProducttype,
    (productProducttype) => productProducttype.productProducts
  )
  @JoinColumn([{ name: "product_type_id", referencedColumnName: "id" }])
  productType: ProductProducttype;

  @ManyToOne(() => TaxTaxclass, (taxTaxclass) => taxTaxclass.productProducts)
  @JoinColumn([{ name: "tax_class_id", referencedColumnName: "id" }])
  taxClass: TaxTaxclass;

  @OneToMany(
    () => ProductProductchannellisting,
    (productProductchannellisting) => productProductchannellisting.product
  )
  productProductchannellistings: ProductProductchannellisting[];

  @OneToMany(
    () => ProductProductmedia,
    (productProductmedia) => productProductmedia.product
  )
  productProductmedias: ProductProductmedia[];

  @OneToMany(
    () => ProductProducttranslation,
    (productProducttranslation) => productProducttranslation.product
  )
  productProducttranslations: ProductProducttranslation[];

  @OneToMany(
    () => ProductProductvariant,
    (productProductvariant) => productProductvariant.product
  )
  productProductvariants: ProductProductvariant[];

  @OneToMany(
    () => ShippingShippingmethodExcludedProducts,
    (shippingShippingmethodExcludedProducts) =>
      shippingShippingmethodExcludedProducts.product
  )
  shippingShippingmethodExcludedProducts: ShippingShippingmethodExcludedProducts[];
}
