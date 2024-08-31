import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductCategory } from "./ProductCategory";

@Index(
  "product_categorytranslat_language_code_category_i_f71fd11d_uniq",
  ["categoryId", "languageCode"],
  { unique: true }
)
@Index("product_categorytranslation_category_id_aa8d0917", ["categoryId"], {})
@Index("product_categorytranslation_pkey", ["id"], { unique: true })
@Entity("product_categorytranslation", { schema: "public" })
export class ProductCategorytranslation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "seo_title",
    nullable: true,
    length: 70,
  })
  seoTitle: string | null;

  @Column("character varying", {
    name: "seo_description",
    nullable: true,
    length: 300,
  })
  seoDescription: string | null;

  @Column("character varying", {
    name: "language_code",
    unique: true,
    length: 35,
  })
  languageCode: string;

  @Column("character varying", { name: "name", nullable: true, length: 128 })
  name: string | null;

  @Column("jsonb", { name: "description", nullable: true })
  description: object | null;

  @Column("integer", { name: "category_id", unique: true })
  categoryId: number;

  @ManyToOne(
    () => ProductCategory,
    (productCategory) => productCategory.productCategorytranslations
  )
  @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
  category: ProductCategory;
}
