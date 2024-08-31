import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProduct } from "./ProductProduct";
import { AttributeAttributevalue } from "./AttributeAttributevalue";

@Index("attribute_assignedproductattributevalue_pkey", ["id"], { unique: true })
@Index(
  "attribute_assignedproduc_value_id_product_id_6f6deb31_uniq",
  ["productId", "valueId"],
  { unique: true }
)
@Index("assignedprodattrval_product_idx", ["productId"], {})
@Index("temp_uniq_value_product", ["productUniq", "valueId"], { unique: true })
@Index(
  "attribute_assignedproductattributevalue_sort_order_3f6252d6",
  ["sortOrder"],
  {}
)
@Index(
  "attribute_assignedproductattributevalue_value_id_9b9c0c68",
  ["valueId"],
  {}
)
@Entity("attribute_assignedproductattributevalue", { schema: "public" })
export class AttributeAssignedproductattributevalue {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @Column("integer", { name: "value_id" })
  valueId: number;

  @Column("integer", { name: "product_id", unique: true })
  productId: number;

  @Column("integer", { name: "product_uniq", nullable: true, unique: true })
  productUniq: number | null;

  @ManyToOne(
    () => ProductProduct,
    (productProduct) => productProduct.attributeAssignedproductattributevalues
  )
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: ProductProduct;

  @ManyToOne(
    () => AttributeAttributevalue,
    (attributeAttributevalue) =>
      attributeAttributevalue.attributeAssignedproductattributevalues
  )
  @JoinColumn([{ name: "value_id", referencedColumnName: "id" }])
  value: AttributeAttributevalue;
}
