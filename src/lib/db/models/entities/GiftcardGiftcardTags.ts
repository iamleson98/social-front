import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GiftcardGiftcard } from "./GiftcardGiftcard";
import { GiftcardGiftcardtag } from "./GiftcardGiftcardtag";

@Index("giftcard_giftcard_tags_giftcard_id_4e7e8444", ["giftcardId"], {})
@Index(
  "giftcard_giftcard_tags_giftcard_id_giftcardtag_id_c8db8a75_uniq",
  ["giftcardId", "giftcardtagId"],
  { unique: true }
)
@Index("giftcard_giftcard_tags_giftcardtag_id_8d425074", ["giftcardtagId"], {})
@Index("giftcard_giftcard_tags_pkey", ["id"], { unique: true })
@Entity("giftcard_giftcard_tags", { schema: "public" })
export class GiftcardGiftcardTags {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "giftcard_id", unique: true })
  giftcardId: number;

  @Column("integer", { name: "giftcardtag_id", unique: true })
  giftcardtagId: number;

  @ManyToOne(
    () => GiftcardGiftcard,
    (giftcardGiftcard) => giftcardGiftcard.giftcardGiftcardTags
  )
  @JoinColumn([{ name: "giftcard_id", referencedColumnName: "id" }])
  giftcard: GiftcardGiftcard;

  @ManyToOne(
    () => GiftcardGiftcardtag,
    (giftcardGiftcardtag) => giftcardGiftcardtag.giftcardGiftcardTags
  )
  @JoinColumn([{ name: "giftcardtag_id", referencedColumnName: "id" }])
  giftcardtag: GiftcardGiftcardtag;
}
