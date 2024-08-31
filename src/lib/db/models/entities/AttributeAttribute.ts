import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAttributepage } from "./AttributeAttributepage";
import { AttributeAttributeproduct } from "./AttributeAttributeproduct";
import { AttributeAttributetranslation } from "./AttributeAttributetranslation";
import { AttributeAttributevalue } from "./AttributeAttributevalue";
import { AttributeAttributevariant } from "./AttributeAttributevariant";

@Index(
  "attribute_gin",
  ["entityType", "inputType", "name", "slug", "type", "unit"],
  {}
)
@Index(
  "attribute_attribute_external_reference_792d92de_like",
  ["externalReference"],
  {}
)
@Index("attribute_attribute_external_reference_key", ["externalReference"], {
  unique: true,
})
@Index("product_productattribute_pkey", ["id"], { unique: true })
@Index("attribute_meta_idx", ["metadata"], {})
@Index("attribute_p_meta_idx", ["privateMetadata"], {})
@Index("product_attribute_slug_a2ba35f2_like", ["slug"], {})
@Index("product_attribute_slug_a2ba35f2_uniq", ["slug"], { unique: true })
@Entity("attribute_attribute", { schema: "public" })
export class AttributeAttribute {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "slug", unique: true, length: 250 })
  slug: string;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("character varying", { name: "input_type", length: 50 })
  inputType: string;

  @Column("boolean", { name: "available_in_grid" })
  availableInGrid: boolean;

  @Column("boolean", { name: "visible_in_storefront" })
  visibleInStorefront: boolean;

  @Column("boolean", { name: "filterable_in_dashboard" })
  filterableInDashboard: boolean;

  @Column("boolean", { name: "filterable_in_storefront" })
  filterableInStorefront: boolean;

  @Column("boolean", { name: "value_required" })
  valueRequired: boolean;

  @Column("integer", { name: "storefront_search_position" })
  storefrontSearchPosition: number;

  @Column("boolean", { name: "is_variant_only" })
  isVariantOnly: boolean;

  @Column("character varying", { name: "type", length: 50 })
  type: string;

  @Column("character varying", {
    name: "entity_type",
    nullable: true,
    length: 50,
  })
  entityType: string | null;

  @Column("character varying", { name: "unit", nullable: true, length: 100 })
  unit: string | null;

  @Column("character varying", {
    name: "external_reference",
    nullable: true,
    unique: true,
    length: 250,
  })
  externalReference: string | null;

  @Column("integer", { name: "max_sort_order", nullable: true })
  maxSortOrder: number | null;

  @OneToMany(
    () => AttributeAttributepage,
    (attributeAttributepage) => attributeAttributepage.attribute
  )
  attributeAttributepages: AttributeAttributepage[];

  @OneToMany(
    () => AttributeAttributeproduct,
    (attributeAttributeproduct) => attributeAttributeproduct.attribute
  )
  attributeAttributeproducts: AttributeAttributeproduct[];

  @OneToMany(
    () => AttributeAttributetranslation,
    (attributeAttributetranslation) => attributeAttributetranslation.attribute
  )
  attributeAttributetranslations: AttributeAttributetranslation[];

  @OneToMany(
    () => AttributeAttributevalue,
    (attributeAttributevalue) => attributeAttributevalue.attribute
  )
  attributeAttributevalues: AttributeAttributevalue[];

  @OneToMany(
    () => AttributeAttributevariant,
    (attributeAttributevariant) => attributeAttributevariant.attribute
  )
  attributeAttributevariants: AttributeAttributevariant[];
}
