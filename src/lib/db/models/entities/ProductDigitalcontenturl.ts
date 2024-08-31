import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductDigitalcontent } from "./ProductDigitalcontent";
import { OrderOrderline } from "./OrderOrderline";

@Index("product_digitalcontenturl_content_id_654197bd", ["contentId"], {})
@Index("product_digitalcontenturl_pkey", ["id"], { unique: true })
@Index(
  "product_digitalcontenturl_order_line_token_id_6f89be20_uniq",
  ["lineId"],
  { unique: true }
)
@Index("product_digitalcontenturl_token_key", ["token"], { unique: true })
@Entity("product_digitalcontenturl", { schema: "public" })
export class ProductDigitalcontenturl {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "token", unique: true })
  token: string;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("integer", { name: "download_num" })
  downloadNum: number;

  @Column("integer", { name: "content_id" })
  contentId: number;

  @Column("uuid", { name: "line_id", nullable: true, unique: true })
  lineId: string | null;

  @ManyToOne(
    () => ProductDigitalcontent,
    (productDigitalcontent) => productDigitalcontent.productDigitalcontenturls
  )
  @JoinColumn([{ name: "content_id", referencedColumnName: "id" }])
  content: ProductDigitalcontent;

  @OneToOne(
    () => OrderOrderline,
    (orderOrderline) => orderOrderline.productDigitalcontenturl
  )
  @JoinColumn([{ name: "line_id", referencedColumnName: "id" }])
  line: OrderOrderline;
}
