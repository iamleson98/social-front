import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProduct } from "./ProductProduct";
import { ProductVariantmedia } from "./ProductVariantmedia";
import { ThumbnailThumbnail } from "./ThumbnailThumbnail";

@Index("product_productmedia_pkey", ["id"], { unique: true })
@Index("productmedia_meta_idx", ["metadata"], {})
@Index("productmedia_p_meta_idx", ["privateMetadata"], {})
@Index("product_productmedia_product_id_b83ecd16", ["productId"], {})
@Index("product_productmedia_sort_order_d9f18acb", ["sortOrder"], {})
@Entity("product_productmedia", { schema: "public" })
export class ProductProductmedia {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @Column("character varying", { name: "image", nullable: true, length: 100 })
  image: string | null;

  @Column("character varying", { name: "alt", length: 250 })
  alt: string;

  @Column("character varying", { name: "type", length: 32 })
  type: string;

  @Column("character varying", {
    name: "external_url",
    nullable: true,
    length: 256,
  })
  externalUrl: string | null;

  @Column("jsonb", { name: "oembed_data" })
  oembedData: object;

  @Column("integer", { name: "product_id", nullable: true })
  productId: number | null;

  @Column("boolean", { name: "to_remove" })
  toRemove: boolean;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @ManyToOne(
    () => ProductProduct,
    (productProduct) => productProduct.productProductmedias
  )
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: ProductProduct;

  @OneToMany(
    () => ProductVariantmedia,
    (productVariantmedia) => productVariantmedia.media
  )
  productVariantmedias: ProductVariantmedia[];

  @OneToMany(
    () => ThumbnailThumbnail,
    (thumbnailThumbnail) => thumbnailThumbnail.productMedia
  )
  thumbnailThumbnails: ThumbnailThumbnail[];
}
