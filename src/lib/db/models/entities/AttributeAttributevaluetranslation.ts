import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAttributevalue } from "./AttributeAttributevalue";

@Index(
  "product_attributechoiceval_attribute_choice_value_id_71c4c0a7",
  ["attributeValueId"],
  {}
)
@Index(
  "product_attributechoicev_language_code_attribute__9b58af18_uniq",
  ["attributeValueId", "languageCode"],
  { unique: true }
)
@Index("product_attributechoicevaluetranslation_pkey", ["id"], { unique: true })
@Entity("attribute_attributevaluetranslation", { schema: "public" })
export class AttributeAttributevaluetranslation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "language_code",
    unique: true,
    length: 35,
  })
  languageCode: string;

  @Column("character varying", { name: "name", length: 250 })
  name: string;

  @Column("integer", { name: "attribute_value_id", unique: true })
  attributeValueId: number;

  @Column("jsonb", { name: "rich_text", nullable: true })
  richText: object | null;

  @Column("text", { name: "plain_text", nullable: true })
  plainText: string | null;

  @ManyToOne(
    () => AttributeAttributevalue,
    (attributeAttributevalue) =>
      attributeAttributevalue.attributeAttributevaluetranslations
  )
  @JoinColumn([{ name: "attribute_value_id", referencedColumnName: "id" }])
  attributeValue: AttributeAttributevalue;
}
