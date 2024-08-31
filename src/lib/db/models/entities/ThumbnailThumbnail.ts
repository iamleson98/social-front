import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppApp } from "./AppApp";
import { AppAppinstallation } from "./AppAppinstallation";
import { ProductCategory } from "./ProductCategory";
import { ProductCollection } from "./ProductCollection";
import { ProductProductmedia } from "./ProductProductmedia";
import { AccountUser } from "./AccountUser";

@Index("thumbnail_thumbnail_app_id_aa70f2d4", ["appId"], {})
@Index(
  "thumbnail_thumbnail_app_installation_id_a5a97d99",
  ["appInstallationId"],
  {}
)
@Index("thumbnail_thumbnail_category_id_e3196106", ["categoryId"], {})
@Index("thumbnail_thumbnail_collection_id_0aa16183", ["collectionId"], {})
@Index("thumbnail_thumbnail_pkey", ["id"], { unique: true })
@Index("thumbnail_thumbnail_product_media_id_85602a99", ["productMediaId"], {})
@Index("thumbnail_thumbnail_user_id_0bc68981", ["userId"], {})
@Entity("thumbnail_thumbnail", { schema: "public" })
export class ThumbnailThumbnail {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "image", length: 100 })
  image: string;

  @Column("integer", { name: "size" })
  size: number;

  @Column("character varying", { name: "format", nullable: true, length: 32 })
  format: string | null;

  @Column("integer", { name: "category_id", nullable: true })
  categoryId: number | null;

  @Column("integer", { name: "collection_id", nullable: true })
  collectionId: number | null;

  @Column("integer", { name: "product_media_id", nullable: true })
  productMediaId: number | null;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("integer", { name: "app_installation_id", nullable: true })
  appInstallationId: number | null;

  @ManyToOne(() => AppApp, (appApp) => appApp.thumbnailThumbnails)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(
    () => AppAppinstallation,
    (appAppinstallation) => appAppinstallation.thumbnailThumbnails
  )
  @JoinColumn([{ name: "app_installation_id", referencedColumnName: "id" }])
  appInstallation: AppAppinstallation;

  @ManyToOne(
    () => ProductCategory,
    (productCategory) => productCategory.thumbnailThumbnails
  )
  @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
  category: ProductCategory;

  @ManyToOne(
    () => ProductCollection,
    (productCollection) => productCollection.thumbnailThumbnails
  )
  @JoinColumn([{ name: "collection_id", referencedColumnName: "id" }])
  collection: ProductCollection;

  @ManyToOne(
    () => ProductProductmedia,
    (productProductmedia) => productProductmedia.thumbnailThumbnails
  )
  @JoinColumn([{ name: "product_media_id", referencedColumnName: "id" }])
  productMedia: ProductProductmedia;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.thumbnailThumbnails
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;
}
