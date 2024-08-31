import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAttribute } from "./AttributeAttribute";
import { PagePagetype } from "./PagePagetype";

@Index(
  "product_attributepage_attribute_id_page_type_id_60aa672e_uniq",
  ["attributeId", "pageTypeId"],
  { unique: true }
)
@Index("product_attributepage_attribute_id_29005ba0", ["attributeId"], {})
@Index("product_attributepage_pkey", ["id"], { unique: true })
@Index("product_attributepage_page_type_id_2723ed1f", ["pageTypeId"], {})
@Index("product_attributepage_sort_order_88af052d", ["sortOrder"], {})
@Entity("attribute_attributepage", { schema: "public" })
export class AttributeAttributepage {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @Column("integer", { name: "attribute_id", unique: true })
  attributeId: number;

  @Column("integer", { name: "page_type_id", unique: true })
  pageTypeId: number;

  @ManyToOne(
    () => AttributeAttribute,
    (attributeAttribute) => attributeAttribute.attributeAttributepages
  )
  @JoinColumn([{ name: "attribute_id", referencedColumnName: "id" }])
  attribute: AttributeAttribute;

  @ManyToOne(
    () => PagePagetype,
    (pagePagetype) => pagePagetype.attributeAttributepages
  )
  @JoinColumn([{ name: "page_type_id", referencedColumnName: "id" }])
  pageType: PagePagetype;
}
