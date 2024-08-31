import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderOrder } from "./OrderOrder";
import { OrderFulfillmentline } from "./OrderFulfillmentline";

@Index("order_fulfillment_pkey", ["id"], { unique: true })
@Index("fulfillment_meta_idx", ["metadata"], {})
@Index("order_fulfillment_order_token_id_9cb8226d", ["orderId"], {})
@Index("fulfillment_p_meta_idx", ["privateMetadata"], {})
@Entity("order_fulfillment", { schema: "public" })
export class OrderFulfillment {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "tracking_number", length: 255 })
  trackingNumber: string;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("integer", { name: "fulfillment_order" })
  fulfillmentOrder: number;

  @Column("character varying", { name: "status", length: 32 })
  status: string;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("numeric", {
    name: "shipping_refund_amount",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  shippingRefundAmount: string | null;

  @Column("numeric", {
    name: "total_refund_amount",
    nullable: true,
    precision: 12,
    scale: 3,
  })
  totalRefundAmount: string | null;

  @Column("uuid", { name: "order_id" })
  orderId: string;

  @ManyToOne(() => OrderOrder, (orderOrder) => orderOrder.orderFulfillments)
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;

  @OneToMany(
    () => OrderFulfillmentline,
    (orderFulfillmentline) => orderFulfillmentline.fulfillment
  )
  orderFulfillmentlines: OrderFulfillmentline[];
}
