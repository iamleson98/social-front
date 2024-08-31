import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductCollection } from "./ProductCollection";
import { DiscountVoucher } from "./DiscountVoucher";

@Index(
  "discount_voucher_collect_voucher_id_collection_id_736b8f24_uniq",
  ["collectionId", "voucherId"],
  { unique: true }
)
@Index(
  "discount_voucher_collections_collection_id_b9de6b54",
  ["collectionId"],
  {}
)
@Index("discount_voucher_collections_pkey", ["id"], { unique: true })
@Index("discount_voucher_collections_voucher_id_4ce1fde3", ["voucherId"], {})
@Entity("discount_voucher_collections", { schema: "public" })
export class DiscountVoucherCollections {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "voucher_id", unique: true })
  voucherId: number;

  @Column("integer", { name: "collection_id", unique: true })
  collectionId: number;

  @ManyToOne(
    () => ProductCollection,
    (productCollection) => productCollection.discountVoucherCollections
  )
  @JoinColumn([{ name: "collection_id", referencedColumnName: "id" }])
  collection: ProductCollection;

  @ManyToOne(
    () => DiscountVoucher,
    (discountVoucher) => discountVoucher.discountVoucherCollections
  )
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: DiscountVoucher;
}
