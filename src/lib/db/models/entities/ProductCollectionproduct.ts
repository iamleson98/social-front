import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductCollection } from "./ProductCollection";
import { ProductProduct } from "./ProductProduct";

@Index(
  "product_collection_products_collection_id_0bc817dc",
  ["collectionId"],
  {}
)
@Index(
  "product_collectionproduc_collection_id_product_id_e582d799_uniq",
  ["collectionId", "productId"],
  { unique: true }
)
@Index("product_collection_products_pkey", ["id"], { unique: true })
@Index("product_collection_products_product_id_a45a5b06", ["productId"], {})
@Index("product_collectionproduct_sort_order_5e7b55bb", ["sortOrder"], {})
@Entity("product_collectionproduct", { schema: "public" })
export class ProductCollectionproduct {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "collection_id", unique: true })
  collectionId: number;

  @Column("integer", { name: "product_id", unique: true })
  productId: number;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @ManyToOne(
    () => ProductCollection,
    (productCollection) => productCollection.productCollectionproducts
  )
  @JoinColumn([{ name: "collection_id", referencedColumnName: "id" }])
  collection: ProductCollection;

  @ManyToOne(
    () => ProductProduct,
    (productProduct) => productProduct.productCollectionproducts
  )
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: ProductProduct;
}
