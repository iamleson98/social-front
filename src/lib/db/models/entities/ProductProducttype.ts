import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAttributeproduct } from "./AttributeAttributeproduct";
import { AttributeAttributevariant } from "./AttributeAttributevariant";
import { ProductProduct } from "./ProductProduct";
import { TaxTaxclass } from "./TaxTaxclass";

@Index("product_productclass_pkey", ["id"], { unique: true })
@Index("producttype_meta_idx", ["metadata"], {})
@Index("product_type_search_gin", ["name", "slug"], {})
@Index("producttype_p_meta_idx", ["privateMetadata"], {})
@Index("product_producttype_slug_6871faf2_like", ["slug"], {})
@Index("product_producttype_slug_key", ["slug"], { unique: true })
@Index("product_producttype_tax_class_id_cc83fe88", ["taxClassId"], {})
@Entity("product_producttype", { schema: "public" })
export class ProductProducttype {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 250 })
  name: string;

  @Column("boolean", { name: "has_variants" })
  hasVariants: boolean;

  @Column("boolean", { name: "is_shipping_required" })
  isShippingRequired: boolean;

  @Column("double precision", { name: "weight", precision: 53 })
  weight: number;

  @Column("boolean", { name: "is_digital" })
  isDigital: boolean;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("character varying", { name: "slug", unique: true, length: 255 })
  slug: string;

  @Column("character varying", { name: "kind", length: 32 })
  kind: string;

  @Column("integer", { name: "tax_class_id", nullable: true })
  taxClassId: number | null;

  @OneToMany(
    () => AttributeAttributeproduct,
    (attributeAttributeproduct) => attributeAttributeproduct.productType
  )
  attributeAttributeproducts: AttributeAttributeproduct[];

  @OneToMany(
    () => AttributeAttributevariant,
    (attributeAttributevariant) => attributeAttributevariant.productType
  )
  attributeAttributevariants: AttributeAttributevariant[];

  @OneToMany(
    () => ProductProduct,
    (productProduct) => productProduct.productType
  )
  productProducts: ProductProduct[];

  @ManyToOne(
    () => TaxTaxclass,
    (taxTaxclass) => taxTaxclass.productProducttypes
  )
  @JoinColumn([{ name: "tax_class_id", referencedColumnName: "id" }])
  taxClass: TaxTaxclass;
}
