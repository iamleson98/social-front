import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GiftcardGiftcard } from "./GiftcardGiftcard";
import { OrderFulfillment } from "./OrderFulfillment";
import { WarehouseStock } from "./WarehouseStock";
import { OrderOrderline } from "./OrderOrderline";

@Index("order_fulfillmentline_fulfillment_id_68f3291d", ["fulfillmentId"], {})
@Index("order_fulfillmentline_pkey", ["id"], { unique: true })
@Index(
  "order_fulfillmentline_order_line_token_id_5d3adfcf",
  ["orderLineId"],
  {}
)
@Index("order_fulfillmentline_stock_id_da5a99fe", ["stockId"], {})
@Entity("order_fulfillmentline", { schema: "public" })
export class OrderFulfillmentline {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "quantity" })
  quantity: number;

  @Column("integer", { name: "fulfillment_id" })
  fulfillmentId: number;

  @Column("integer", { name: "stock_id", nullable: true })
  stockId: number | null;

  @Column("uuid", { name: "order_line_id" })
  orderLineId: string;

  @OneToMany(
    () => GiftcardGiftcard,
    (giftcardGiftcard) => giftcardGiftcard.fulfillmentLine
  )
  giftcardGiftcards: GiftcardGiftcard[];

  @ManyToOne(
    () => OrderFulfillment,
    (orderFulfillment) => orderFulfillment.orderFulfillmentlines
  )
  @JoinColumn([{ name: "fulfillment_id", referencedColumnName: "id" }])
  fulfillment: OrderFulfillment;

  @ManyToOne(
    () => WarehouseStock,
    (warehouseStock) => warehouseStock.orderFulfillmentlines
  )
  @JoinColumn([{ name: "stock_id", referencedColumnName: "id" }])
  stock: WarehouseStock;

  @ManyToOne(
    () => OrderOrderline,
    (orderOrderline) => orderOrderline.orderFulfillmentlines
  )
  @JoinColumn([{ name: "order_line_id", referencedColumnName: "id" }])
  orderLine: OrderOrderline;
}
