import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CheckoutCheckoutGiftCards } from "./CheckoutCheckoutGiftCards";
import { AppApp } from "./AppApp";
import { AccountUser } from "./AccountUser";
import { OrderFulfillmentline } from "./OrderFulfillmentline";
import { ProductProduct } from "./ProductProduct";
import { GiftcardGiftcardTags } from "./GiftcardGiftcardTags";
import { GiftcardGiftcardevent } from "./GiftcardGiftcardevent";
import { OrderOrderGiftCards } from "./OrderOrderGiftCards";

@Index("giftcard_giftcard_app_id_8d9d46f0", ["appId"], {})
@Index("giftcard_giftcard_code_key", ["code"], { unique: true })
@Index("giftcard_giftcard_code_f6fb6be8_like", ["code"], {})
@Index("giftcard_giftcard_created_at_62cb921a", ["createdAt"], {})
@Index("giftcard_giftcard_created_by_id_b70093de", ["createdById"], {})
@Index(
  "giftcard_giftcard_fulfillment_line_id_f5bb8062",
  ["fulfillmentLineId"],
  {}
)
@Index("giftcard_giftcard_pkey", ["id"], { unique: true })
@Index("giftcard_meta_idx", ["metadata"], {})
@Index("giftcard_p_meta_idx", ["privateMetadata"], {})
@Index("giftcard_giftcard_product_id_d4ad7ecd", ["productId"], {})
@Index("giftcard_tsearch", ["searchVector"], {})
@Index("giftcard_giftcard_used_by_id_4e019509", ["usedById"], {})
@Entity("giftcard_giftcard", { schema: "public" })
export class GiftcardGiftcard {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "code", unique: true, length: 16 })
  code: string;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "last_used_on", nullable: true })
  lastUsedOn: Date | null;

  @Column("boolean", { name: "is_active" })
  isActive: boolean;

  @Column("numeric", {
    name: "initial_balance_amount",
    precision: 12,
    scale: 3,
  })
  initialBalanceAmount: string;

  @Column("numeric", {
    name: "current_balance_amount",
    precision: 12,
    scale: 3,
  })
  currentBalanceAmount: string;

  @Column("character varying", { name: "currency", length: 3 })
  currency: string;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("integer", { name: "created_by_id", nullable: true })
  createdById: number | null;

  @Column("character varying", {
    name: "created_by_email",
    nullable: true,
    length: 254,
  })
  createdByEmail: string | null;

  @Column("date", { name: "expiry_date", nullable: true })
  expiryDate: string | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("integer", { name: "product_id", nullable: true })
  productId: number | null;

  @Column("integer", { name: "used_by_id", nullable: true })
  usedById: number | null;

  @Column("character varying", {
    name: "used_by_email",
    nullable: true,
    length: 254,
  })
  usedByEmail: string | null;

  @Column("integer", { name: "fulfillment_line_id", nullable: true })
  fulfillmentLineId: number | null;

  @Column("boolean", { name: "search_index_dirty", default: () => "true" })
  searchIndexDirty: boolean;

  @Column("tsvector", { name: "search_vector", nullable: true })
  searchVector: string | null;

  @OneToMany(
    () => CheckoutCheckoutGiftCards,
    (checkoutCheckoutGiftCards) => checkoutCheckoutGiftCards.giftcard
  )
  checkoutCheckoutGiftCards: CheckoutCheckoutGiftCards[];

  @ManyToOne(() => AppApp, (appApp) => appApp.giftcardGiftcards)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(() => AccountUser, (accountUser) => accountUser.giftcardGiftcards)
  @JoinColumn([{ name: "created_by_id", referencedColumnName: "id" }])
  createdBy: AccountUser;

  @ManyToOne(
    () => OrderFulfillmentline,
    (orderFulfillmentline) => orderFulfillmentline.giftcardGiftcards
  )
  @JoinColumn([{ name: "fulfillment_line_id", referencedColumnName: "id" }])
  fulfillmentLine: OrderFulfillmentline;

  @ManyToOne(
    () => ProductProduct,
    (productProduct) => productProduct.giftcardGiftcards
  )
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: ProductProduct;

  @ManyToOne(() => AccountUser, (accountUser) => accountUser.giftcardGiftcards2)
  @JoinColumn([{ name: "used_by_id", referencedColumnName: "id" }])
  usedBy: AccountUser;

  @OneToMany(
    () => GiftcardGiftcardTags,
    (giftcardGiftcardTags) => giftcardGiftcardTags.giftcard
  )
  giftcardGiftcardTags: GiftcardGiftcardTags[];

  @OneToMany(
    () => GiftcardGiftcardevent,
    (giftcardGiftcardevent) => giftcardGiftcardevent.giftCard
  )
  giftcardGiftcardevents: GiftcardGiftcardevent[];

  @OneToMany(
    () => OrderOrderGiftCards,
    (orderOrderGiftCards) => orderOrderGiftCards.giftcard
  )
  orderOrderGiftCards: OrderOrderGiftCards[];
}
