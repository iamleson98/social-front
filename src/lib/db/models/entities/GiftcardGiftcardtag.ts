import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GiftcardGiftcardTags } from "./GiftcardGiftcardTags";

@Index("giftcard_giftcardtag_pkey", ["id"], { unique: true })
@Index("giftcard_giftcardtag_name_key", ["name"], { unique: true })
@Index("giftcard_giftcardtag_name_215cd989_like", ["name"], {})
@Index("gift_card_tag_search_gin", ["name"], {})
@Entity("giftcard_giftcardtag", { schema: "public" })
export class GiftcardGiftcardtag {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", unique: true, length: 255 })
  name: string;

  @OneToMany(
    () => GiftcardGiftcardTags,
    (giftcardGiftcardTags) => giftcardGiftcardTags.giftcardtag
  )
  giftcardGiftcardTags: GiftcardGiftcardTags[];
}
