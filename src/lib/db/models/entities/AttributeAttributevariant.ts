import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAssignedvariantattribute } from "./AttributeAssignedvariantattribute";
import { AttributeAttribute } from "./AttributeAttribute";
import { ProductProducttype } from "./ProductProducttype";

@Index(
  "product_attributevariant_attribute_id_product_typ_304d6c95_uniq",
  ["attributeId", "productTypeId"],
  { unique: true }
)
@Index("product_attributevariant_attribute_id_e47d3bc3", ["attributeId"], {})
@Index("product_attributevariant_pkey", ["id"], { unique: true })
@Index(
  "product_attributevariant_product_type_id_ba95c6dd",
  ["productTypeId"],
  {}
)
@Index("product_attributevariant_sort_order_cf4b00ef", ["sortOrder"], {})
@Entity("attribute_attributevariant", { schema: "public" })
export class AttributeAttributevariant {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "attribute_id", unique: true })
  attributeId: number;

  @Column("integer", { name: "product_type_id", unique: true })
  productTypeId: number;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @Column("boolean", { name: "variant_selection" })
  variantSelection: boolean;

  @OneToMany(
    () => AttributeAssignedvariantattribute,
    (attributeAssignedvariantattribute) =>
      attributeAssignedvariantattribute.assignment
  )
  attributeAssignedvariantattributes: AttributeAssignedvariantattribute[];

  @ManyToOne(
    () => AttributeAttribute,
    (attributeAttribute) => attributeAttribute.attributeAttributevariants
  )
  @JoinColumn([{ name: "attribute_id", referencedColumnName: "id" }])
  attribute: AttributeAttribute;

  @ManyToOne(
    () => ProductProducttype,
    (productProducttype) => productProducttype.attributeAttributevariants
  )
  @JoinColumn([{ name: "product_type_id", referencedColumnName: "id" }])
  productType: ProductProducttype;
}
