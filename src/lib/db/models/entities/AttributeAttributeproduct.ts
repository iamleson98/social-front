import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAttribute } from "./AttributeAttribute";
import { ProductProducttype } from "./ProductProducttype";

@Index("product_attributeproduct_attribute_id_0051c706", ["attributeId"], {})
@Index(
  "product_attributeproduct_attribute_id_product_typ_85ea87be_uniq",
  ["attributeId", "productTypeId"],
  { unique: true }
)
@Index("product_attributeproduct_pkey", ["id"], { unique: true })
@Index(
  "product_attributeproduct_product_type_id_54357b3b",
  ["productTypeId"],
  {}
)
@Index("product_attributeproduct_sort_order_cec8a8e2", ["sortOrder"], {})
@Entity("attribute_attributeproduct", { schema: "public" })
export class AttributeAttributeproduct {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "attribute_id", unique: true })
  attributeId: number;

  @Column("integer", { name: "product_type_id", unique: true })
  productTypeId: number;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @ManyToOne(
    () => AttributeAttribute,
    (attributeAttribute) => attributeAttribute.attributeAttributeproducts
  )
  @JoinColumn([{ name: "attribute_id", referencedColumnName: "id" }])
  attribute: AttributeAttribute;

  @ManyToOne(
    () => ProductProducttype,
    (productProducttype) => productProducttype.attributeAttributeproducts
  )
  @JoinColumn([{ name: "product_type_id", referencedColumnName: "id" }])
  productType: ProductProducttype;
}
