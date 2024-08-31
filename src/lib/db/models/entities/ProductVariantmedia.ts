import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProductmedia } from "./ProductProductmedia";
import { ProductProductvariant } from "./ProductProductvariant";

@Index("product_variantmedia_pkey", ["id"], { unique: true })
@Index("product_variantmedia_media_id_e94208c4", ["mediaId"], {})
@Index(
  "product_variantmedia_variant_id_media_id_003e4321_uniq",
  ["mediaId", "variantId"],
  { unique: true }
)
@Index("product_variantmedia_variant_id_2a29a589", ["variantId"], {})
@Entity("product_variantmedia", { schema: "public" })
export class ProductVariantmedia {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "media_id", unique: true })
  mediaId: number;

  @Column("integer", { name: "variant_id", unique: true })
  variantId: number;

  @ManyToOne(
    () => ProductProductmedia,
    (productProductmedia) => productProductmedia.productVariantmedias
  )
  @JoinColumn([{ name: "media_id", referencedColumnName: "id" }])
  media: ProductProductmedia;

  @ManyToOne(
    () => ProductProductvariant,
    (productProductvariant) => productProductvariant.productVariantmedias
  )
  @JoinColumn([{ name: "variant_id", referencedColumnName: "id" }])
  variant: ProductProductvariant;
}
