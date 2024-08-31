import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProductvariant } from "./ProductProductvariant";

@Index("product_productvarianttranslation_pkey", ["id"], { unique: true })
@Index(
  "product_productvarianttr_language_code_product_va_cf16d8d0_uniq",
  ["languageCode", "productVariantId"],
  { unique: true }
)
@Index(
  "product_productvarianttranslation_product_variant_id_1b144a85",
  ["productVariantId"],
  {}
)
@Entity("product_productvarianttranslation", { schema: "public" })
export class ProductProductvarianttranslation {
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

  @Column("integer", { name: "product_variant_id", unique: true })
  productVariantId: number;

  @ManyToOne(
    () => ProductProductvariant,
    (productProductvariant) =>
      productProductvariant.productProductvarianttranslations
  )
  @JoinColumn([{ name: "product_variant_id", referencedColumnName: "id" }])
  productVariant: ProductProductvariant;
}
