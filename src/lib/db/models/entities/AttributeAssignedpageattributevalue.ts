import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PagePage } from "./PagePage";
import { AttributeAttributevalue } from "./AttributeAttributevalue";

@Index("attribute_assignedpageattributevalue_pkey", ["id"], { unique: true })
@Index(
  "attribute_assignedpageat_value_id_page_id_851cd501_uniq",
  ["pageId", "valueId"],
  { unique: true }
)
@Index("assignedpageattrvalue_page_idx", ["pageId"], {})
@Index("temp_uniq_value_page", ["pageUniq", "valueId"], { unique: true })
@Index(
  "attribute_assignedpageattributevalue_sort_order_4a2a6d66",
  ["sortOrder"],
  {}
)
@Index(
  "attribute_assignedpageattributevalue_value_id_9d9ee1aa",
  ["valueId"],
  {}
)
@Entity("attribute_assignedpageattributevalue", { schema: "public" })
export class AttributeAssignedpageattributevalue {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @Column("integer", { name: "value_id" })
  valueId: number;

  @Column("integer", { name: "page_id", unique: true })
  pageId: number;

  @Column("integer", { name: "page_uniq", nullable: true, unique: true })
  pageUniq: number | null;

  @ManyToOne(
    () => PagePage,
    (pagePage) => pagePage.attributeAssignedpageattributevalues
  )
  @JoinColumn([{ name: "page_id", referencedColumnName: "id" }])
  page: PagePage;

  @ManyToOne(
    () => AttributeAttributevalue,
    (attributeAttributevalue) =>
      attributeAttributevalue.attributeAssignedpageattributevalues
  )
  @JoinColumn([{ name: "value_id", referencedColumnName: "id" }])
  value: AttributeAttributevalue;
}
