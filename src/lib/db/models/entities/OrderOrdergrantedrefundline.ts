import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderOrdergrantedrefund } from "./OrderOrdergrantedrefund";
import { OrderOrderline } from "./OrderOrderline";

@Index(
  "order_ordergrantedrefundline_granted_refund_id_cd1bb9f6",
  ["grantedRefundId"],
  {}
)
@Index("order_ordergrantedrefundline_pkey", ["id"], { unique: true })
@Index(
  "order_ordergrantedrefundline_order_line_id_c2b8e4af",
  ["orderLineId"],
  {}
)
@Entity("order_ordergrantedrefundline", { schema: "public" })
export class OrderOrdergrantedrefundline {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "quantity" })
  quantity: number;

  @Column("integer", { name: "granted_refund_id" })
  grantedRefundId: number;

  @Column("uuid", { name: "order_line_id" })
  orderLineId: string;

  @Column("text", { name: "reason", nullable: true })
  reason: string | null;

  @ManyToOne(
    () => OrderOrdergrantedrefund,
    (orderOrdergrantedrefund) =>
      orderOrdergrantedrefund.orderOrdergrantedrefundlines
  )
  @JoinColumn([{ name: "granted_refund_id", referencedColumnName: "id" }])
  grantedRefund: OrderOrdergrantedrefund;

  @ManyToOne(
    () => OrderOrderline,
    (orderOrderline) => orderOrderline.orderOrdergrantedrefundlines
  )
  @JoinColumn([{ name: "order_line_id", referencedColumnName: "id" }])
  orderLine: OrderOrderline;
}
