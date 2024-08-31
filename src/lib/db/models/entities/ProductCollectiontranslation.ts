import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductCollection } from "./ProductCollection";

@Index(
  "product_collectiontranslation_collection_id_cfbbd453",
  ["collectionId"],
  {}
)
@Index(
  "product_collectiontransl_language_code_collection_b1200cd5_uniq",
  ["collectionId", "languageCode"],
  { unique: true }
)
@Index("product_collectiontranslation_pkey", ["id"], { unique: true })
@Entity("product_collectiontranslation", { schema: "public" })
export class ProductCollectiontranslation {
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

  @Column("integer", { name: "collection_id", unique: true })
  collectionId: number;

  @Column("jsonb", { name: "description", nullable: true })
  description: object | null;

  @ManyToOne(
    () => ProductCollection,
    (productCollection) => productCollection.productCollectiontranslations
  )
  @JoinColumn([{ name: "collection_id", referencedColumnName: "id" }])
  collection: ProductCollection;
}
