import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAttribute } from "./AttributeAttribute";

@Index(
  "product_productattributetr_product_attribute_id_56b48511",
  ["attributeId"],
  {}
)
@Index(
  "product_productattribute_language_code_product_at_58451db2_uniq",
  ["attributeId", "languageCode"],
  { unique: true }
)
@Index("product_productattributetranslation_pkey", ["id"], { unique: true })
@Entity("attribute_attributetranslation", { schema: "public" })
export class AttributeAttributetranslation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "language_code",
    unique: true,
    length: 35,
  })
  languageCode: string;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("integer", { name: "attribute_id", unique: true })
  attributeId: number;

  @ManyToOne(
    () => AttributeAttribute,
    (attributeAttribute) => attributeAttribute.attributeAttributetranslations
  )
  @JoinColumn([{ name: "attribute_id", referencedColumnName: "id" }])
  attribute: AttributeAttribute;
}
