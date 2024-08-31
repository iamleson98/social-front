import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAttributevariant } from "./AttributeAttributevariant";
import { ProductProductvariant } from "./ProductProductvariant";
import { AttributeAssignedvariantattributevalue } from "./AttributeAssignedvariantattributevalue";

@Index(
  "product_assignedvarianta_variant_id_assignment_id_16584418_uniq",
  ["assignmentId", "variantId"],
  { unique: true }
)
@Index(
  "product_assignedvariantattribute_assignment_id_8fdbffe8",
  ["assignmentId"],
  {}
)
@Index("product_assignedvariantattribute_pkey", ["id"], { unique: true })
@Index(
  "product_assignedvariantattribute_variant_id_27483e6a",
  ["variantId"],
  {}
)
@Entity("attribute_assignedvariantattribute", { schema: "public" })
export class AttributeAssignedvariantattribute {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "variant_id", unique: true })
  variantId: number;

  @Column("integer", { name: "assignment_id", unique: true })
  assignmentId: number;

  @ManyToOne(
    () => AttributeAttributevariant,
    (attributeAttributevariant) =>
      attributeAttributevariant.attributeAssignedvariantattributes
  )
  @JoinColumn([{ name: "assignment_id", referencedColumnName: "id" }])
  assignment: AttributeAttributevariant;

  @ManyToOne(
    () => ProductProductvariant,
    (productProductvariant) =>
      productProductvariant.attributeAssignedvariantattributes
  )
  @JoinColumn([{ name: "variant_id", referencedColumnName: "id" }])
  variant: ProductProductvariant;

  @OneToMany(
    () => AttributeAssignedvariantattributevalue,
    (attributeAssignedvariantattributevalue) =>
      attributeAssignedvariantattributevalue.assignment
  )
  attributeAssignedvariantattributevalues: AttributeAssignedvariantattributevalue[];
}
