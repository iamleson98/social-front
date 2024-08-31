import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChannel } from "./ChannelChannel";
import { ProductCollection } from "./ProductCollection";

@Index(
  "product_collectionchannellisting_channel_id_5e167702",
  ["channelId"],
  {}
)
@Index(
  "product_collectionchanne_collection_id_channel_id_43d58a4f_uniq",
  ["channelId", "collectionId"],
  { unique: true }
)
@Index(
  "product_collectionchannellisting_collection_id_2ce1b16b",
  ["collectionId"],
  {}
)
@Index("product_collectionchannellisting_pkey", ["id"], { unique: true })
@Entity("product_collectionchannellisting", { schema: "public" })
export class ProductCollectionchannellisting {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "published_at", nullable: true })
  publishedAt: Date | null;

  @Column("boolean", { name: "is_published" })
  isPublished: boolean;

  @Column("integer", { name: "channel_id", unique: true })
  channelId: number;

  @Column("integer", { name: "collection_id", unique: true })
  collectionId: number;

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.productCollectionchannellistings
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @ManyToOne(
    () => ProductCollection,
    (productCollection) => productCollection.productCollectionchannellistings
  )
  @JoinColumn([{ name: "collection_id", referencedColumnName: "id" }])
  collection: ProductCollection;
}
