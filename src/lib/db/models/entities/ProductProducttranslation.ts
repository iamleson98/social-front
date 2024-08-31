import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProduct } from "./ProductProduct";

@Index("product_producttranslation_pkey", ["id"], { unique: true })
@Index(
  "product_producttranslati_language_code_product_id_b06ba774_uniq",
  ["languageCode", "productId"],
  { unique: true }
)
@Index("product_producttranslation_product_id_2c2c7532", ["productId"], {})
@Entity("product_producttranslation", { schema: "public" })
export class ProductProducttranslation {
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

  @Column("character varying", { name: "name", nullable: true, length: 250 })
  name: string | null;

  @Column("jsonb", { name: "description", nullable: true })
  description: object | null;

  @Column("integer", { name: "product_id", unique: true })
  productId: number;

  @ManyToOne(
    () => ProductProduct,
    (productProduct) => productProduct.productProducttranslations
  )
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: ProductProduct;
}
