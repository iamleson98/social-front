import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DiscountVoucherCategories } from "./DiscountVoucherCategories";
import { MenuMenuitem } from "./MenuMenuitem";
import { ProductCategorytranslation } from "./ProductCategorytranslation";
import { ProductProduct } from "./ProductProduct";
import { ThumbnailThumbnail } from "./ThumbnailThumbnail";

@Index(
  "category_search_name_slug_gin",
  ["descriptionPlaintext", "name", "slug"],
  {}
)
@Index("product_category_pkey", ["id"], { unique: true })
@Index("category_meta_idx", ["metadata"], {})
@Index("product_category_parent_id_f6860923", ["parentId"], {})
@Index("category_p_meta_idx", ["privateMetadata"], {})
@Index("product_category_slug_e1f8ccc4_uniq", ["slug"], { unique: true })
@Index("product_category_slug_e1f8ccc4_like", ["slug"], {})
@Index("product_category_tree_id_f3c46461", ["treeId"], {})
@Index("updated_at_idx", ["updatedAt"], {})
@Entity("product_category", { schema: "public" })
export class ProductCategory {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 250 })
  name: string;

  @Column("character varying", { name: "slug", unique: true, length: 255 })
  slug: string;

  @Column("jsonb", { name: "description", nullable: true })
  description: object | null;

  @Column("integer", { name: "lft" })
  lft: number;

  @Column("integer", { name: "rght" })
  rght: number;

  @Column("integer", { name: "tree_id" })
  treeId: number;

  @Column("integer", { name: "level" })
  level: number;

  @Column("integer", { name: "parent_id", nullable: true })
  parentId: number | null;

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

  @Column("character varying", { name: "background_image_alt", length: 128 })
  backgroundImageAlt: string;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("text", { name: "description_plaintext" })
  descriptionPlaintext: string;

  @Column("timestamp with time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "now()",
  })
  updatedAt: Date | null;

  @OneToMany(
    () => DiscountVoucherCategories,
    (discountVoucherCategories) => discountVoucherCategories.category
  )
  discountVoucherCategories: DiscountVoucherCategories[];

  @OneToMany(() => MenuMenuitem, (menuMenuitem) => menuMenuitem.category)
  menuMenuitems: MenuMenuitem[];

  @ManyToOne(
    () => ProductCategory,
    (productCategory) => productCategory.productCategories
  )
  @JoinColumn([{ name: "parent_id", referencedColumnName: "id" }])
  parent: ProductCategory;

  @OneToMany(() => ProductCategory, (productCategory) => productCategory.parent)
  productCategories: ProductCategory[];

  @OneToMany(
    () => ProductCategorytranslation,
    (productCategorytranslation) => productCategorytranslation.category
  )
  productCategorytranslations: ProductCategorytranslation[];

  @OneToMany(() => ProductProduct, (productProduct) => productProduct.category)
  productProducts: ProductProduct[];

  @OneToMany(
    () => ThumbnailThumbnail,
    (thumbnailThumbnail) => thumbnailThumbnail.category
  )
  thumbnailThumbnails: ThumbnailThumbnail[];
}
