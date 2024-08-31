import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAssignedvariantattribute } from "./AttributeAssignedvariantattribute";
import { AttributeAttributevalue } from "./AttributeAttributevalue";

@Index(
  "attribute_assignedvarian_value_id_assignment_id_6f7e4e27_uniq",
  ["assignmentId", "valueId"],
  { unique: true }
)
@Index(
  "attribute_assignedvariantattributevalue_assignment_id_040f7499",
  ["assignmentId"],
  {}
)
@Index("attribute_assignedvariantattributevalue_pkey", ["id"], { unique: true })
@Index(
  "attribute_assignedvariantattributevalue_sort_order_3e207536",
  ["sortOrder"],
  {}
)
@Index(
  "attribute_assignedvariantattributevalue_value_id_4bbdc9fa",
  ["valueId"],
  {}
)
@Entity("attribute_assignedvariantattributevalue", { schema: "public" })
export class AttributeAssignedvariantattributevalue {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @Column("integer", { name: "assignment_id", unique: true })
  assignmentId: number;

  @Column("integer", { name: "value_id", unique: true })
  valueId: number;

  @ManyToOne(
    () => AttributeAssignedvariantattribute,
    (attributeAssignedvariantattribute) =>
      attributeAssignedvariantattribute.attributeAssignedvariantattributevalues
  )
  @JoinColumn([{ name: "assignment_id", referencedColumnName: "id" }])
  assignment: AttributeAssignedvariantattribute;

  @ManyToOne(
    () => AttributeAttributevalue,
    (attributeAttributevalue) =>
      attributeAttributevalue.attributeAssignedvariantattributevalues
  )
  @JoinColumn([{ name: "value_id", referencedColumnName: "id" }])
  value: AttributeAttributevalue;
}
