import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAssignedpageattributevalue } from "./AttributeAssignedpageattributevalue";
import { AttributeAssignedproductattributevalue } from "./AttributeAssignedproductattributevalue";
import { AttributeAssignedvariantattributevalue } from "./AttributeAssignedvariantattributevalue";
import { AttributeAttribute } from "./AttributeAttribute";
import { PagePage } from "./PagePage";
import { ProductProduct } from "./ProductProduct";
import { ProductProductvariant } from "./ProductProductvariant";
import { AttributeAttributevaluetranslation } from "./AttributeAttributevaluetranslation";

@Index(
  "product_attributechoicevalue_attribute_id_c28c6c92",
  ["attributeId"],
  {}
)
@Index(
  "product_attributevalue_slug_attribute_id_a9b19472_uniq",
  ["attributeId", "slug"],
  { unique: true }
)
@Index(
  "attribute_attributevalue_external_reference_c57fc8fd_like",
  ["externalReference"],
  {}
)
@Index(
  "attribute_attributevalue_external_reference_key",
  ["externalReference"],
  { unique: true }
)
@Index("product_attributechoicevalue_pkey", ["id"], { unique: true })
@Index("attribute_search_gin", ["name", "slug"], {})
@Index(
  "attribute_attributevalue_reference_page_id_33727843",
  ["referencePageId"],
  {}
)
@Index(
  "attribute_attributevalue_reference_product_id_43329b37",
  ["referenceProductId"],
  {}
)
@Index(
  "attribute_attributevalue_reference_variant_id_670c09ee",
  ["referenceVariantId"],
  {}
)
@Index("product_attributechoicevalue_slug_e0d2d25b", ["slug"], {})
@Index("product_attributechoicevalue_slug_e0d2d25b_like", ["slug"], {})
@Index("product_attributechoicevalue_sort_order_c4c071c4", ["sortOrder"], {})
@Entity("attribute_attributevalue", { schema: "public" })
export class AttributeAttributevalue {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 250 })
  name: string;

  @Column("integer", { name: "attribute_id", unique: true })
  attributeId: number;

  @Column("character varying", { name: "slug", unique: true, length: 255 })
  slug: string;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @Column("character varying", { name: "value", length: 255 })
  value: string;

  @Column("character varying", {
    name: "content_type",
    nullable: true,
    length: 50,
  })
  contentType: string | null;

  @Column("character varying", {
    name: "file_url",
    nullable: true,
    length: 200,
  })
  fileUrl: string | null;

  @Column("jsonb", { name: "rich_text", nullable: true })
  richText: object | null;

  @Column("boolean", { name: "boolean", nullable: true })
  boolean: boolean | null;

  @Column("timestamp with time zone", { name: "date_time", nullable: true })
  dateTime: Date | null;

  @Column("integer", { name: "reference_page_id", nullable: true })
  referencePageId: number | null;

  @Column("integer", { name: "reference_product_id", nullable: true })
  referenceProductId: number | null;

  @Column("text", { name: "plain_text", nullable: true })
  plainText: string | null;

  @Column("integer", { name: "reference_variant_id", nullable: true })
  referenceVariantId: number | null;

  @Column("character varying", {
    name: "external_reference",
    nullable: true,
    unique: true,
    length: 250,
  })
  externalReference: string | null;

  @OneToMany(
    () => AttributeAssignedpageattributevalue,
    (attributeAssignedpageattributevalue) =>
      attributeAssignedpageattributevalue.value
  )
  attributeAssignedpageattributevalues: AttributeAssignedpageattributevalue[];

  @OneToMany(
    () => AttributeAssignedproductattributevalue,
    (attributeAssignedproductattributevalue) =>
      attributeAssignedproductattributevalue.value
  )
  attributeAssignedproductattributevalues: AttributeAssignedproductattributevalue[];

  @OneToMany(
    () => AttributeAssignedvariantattributevalue,
    (attributeAssignedvariantattributevalue) =>
      attributeAssignedvariantattributevalue.value
  )
  attributeAssignedvariantattributevalues: AttributeAssignedvariantattributevalue[];

  @ManyToOne(
    () => AttributeAttribute,
    (attributeAttribute) => attributeAttribute.attributeAttributevalues
  )
  @JoinColumn([{ name: "attribute_id", referencedColumnName: "id" }])
  attribute: AttributeAttribute;

  @ManyToOne(() => PagePage, (pagePage) => pagePage.attributeAttributevalues)
  @JoinColumn([{ name: "reference_page_id", referencedColumnName: "id" }])
  referencePage: PagePage;

  @ManyToOne(
    () => ProductProduct,
    (productProduct) => productProduct.attributeAttributevalues
  )
  @JoinColumn([{ name: "reference_product_id", referencedColumnName: "id" }])
  referenceProduct: ProductProduct;

  @ManyToOne(
    () => ProductProductvariant,
    (productProductvariant) => productProductvariant.attributeAttributevalues
  )
  @JoinColumn([{ name: "reference_variant_id", referencedColumnName: "id" }])
  referenceVariant: ProductProductvariant;

  @OneToMany(
    () => AttributeAttributevaluetranslation,
    (attributeAttributevaluetranslation) =>
      attributeAttributevaluetranslation.attributeValue
  )
  attributeAttributevaluetranslations: AttributeAttributevaluetranslation[];
}
