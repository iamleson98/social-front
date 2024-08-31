import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DiscountVoucherCollections } from "./DiscountVoucherCollections";
import { MenuMenuitem } from "./MenuMenuitem";
import { ProductCollectionchannellisting } from "./ProductCollectionchannellisting";
import { ProductCollectionproduct } from "./ProductCollectionproduct";
import { ProductCollectiontranslation } from "./ProductCollectiontranslation";
import { ThumbnailThumbnail } from "./ThumbnailThumbnail";

@Index("product_collection_pkey", ["id"], { unique: true })
@Index("collection_meta_idx", ["metadata"], {})
@Index("collection_search_gin", ["name", "slug"], {})
@Index("collection_p_meta_idx", ["privateMetadata"], {})
@Index("product_collection_slug_ec186116_like", ["slug"], {})
@Index("product_collection_slug_ec186116_uniq", ["slug"], { unique: true })
@Entity("product_collection", { schema: "public" })
export class ProductCollection {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 250 })
  name: string;

  @Column("character varying", { name: "slug", unique: true, length: 255 })
  slug: string;

  @Column("character varying", {
    name: "background_image",
    nullable: true,
    length: 100,
  })
  backgroundImage: string | null;

  @Column("character varying", {
    name: "seo_description",
    nullable: true,
    length: 300,
  })
  seoDescription: string | null;

  @Column("character varying", {
    name: "seo_title",
    nullable: true,
    length: 70,
  })
  seoTitle: string | null;

  @Column("jsonb", { name: "description", nullable: true })
  description: object | null;

  @Column("character varying", { name: "background_image_alt", length: 128 })
  backgroundImageAlt: string;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @OneToMany(
    () => DiscountVoucherCollections,
    (discountVoucherCollections) => discountVoucherCollections.collection
  )
  discountVoucherCollections: DiscountVoucherCollections[];

  @OneToMany(() => MenuMenuitem, (menuMenuitem) => menuMenuitem.collection)
  menuMenuitems: MenuMenuitem[];

  @OneToMany(
    () => ProductCollectionchannellisting,
    (productCollectionchannellisting) =>
      productCollectionchannellisting.collection
  )
  productCollectionchannellistings: ProductCollectionchannellisting[];

  @OneToMany(
    () => ProductCollectionproduct,
    (productCollectionproduct) => productCollectionproduct.collection
  )
  productCollectionproducts: ProductCollectionproduct[];

  @OneToMany(
    () => ProductCollectiontranslation,
    (productCollectiontranslation) => productCollectiontranslation.collection
  )
  productCollectiontranslations: ProductCollectiontranslation[];

  @OneToMany(
    () => ThumbnailThumbnail,
    (thumbnailThumbnail) => thumbnailThumbnail.collection
  )
  thumbnailThumbnails: ThumbnailThumbnail[];
}
