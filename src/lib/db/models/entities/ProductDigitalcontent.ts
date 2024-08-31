import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductProductvariant } from "./ProductProductvariant";
import { ProductDigitalcontenturl } from "./ProductDigitalcontenturl";

@Index("product_digitalcontent_pkey", ["id"], { unique: true })
@Index("digitalcontent_meta_idx", ["metadata"], {})
@Index("digitalcontent_p_meta_idx", ["privateMetadata"], {})
@Index("product_digitalcontent_product_variant_id_key", ["productVariantId"], {
  unique: true,
})
@Entity("product_digitalcontent", { schema: "public" })
export class ProductDigitalcontent {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("boolean", { name: "use_default_settings" })
  useDefaultSettings: boolean;

  @Column("boolean", { name: "automatic_fulfillment" })
  automaticFulfillment: boolean;

  @Column("character varying", { name: "content_type", length: 128 })
  contentType: string;

  @Column("character varying", { name: "content_file", length: 100 })
  contentFile: string;

  @Column("integer", { name: "max_downloads", nullable: true })
  maxDownloads: number | null;

  @Column("integer", { name: "url_valid_days", nullable: true })
  urlValidDays: number | null;

  @Column("integer", { name: "product_variant_id", unique: true })
  productVariantId: number;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @OneToOne(
    () => ProductProductvariant,
    (productProductvariant) => productProductvariant.productDigitalcontent
  )
  @JoinColumn([{ name: "product_variant_id", referencedColumnName: "id" }])
  productVariant: ProductProductvariant;

  @OneToMany(
    () => ProductDigitalcontenturl,
    (productDigitalcontenturl) => productDigitalcontenturl.content
  )
  productDigitalcontenturls: ProductDigitalcontenturl[];
}
