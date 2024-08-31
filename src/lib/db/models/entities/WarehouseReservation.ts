import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { WarehouseStock } from "./WarehouseStock";
import { CheckoutCheckoutline } from "./CheckoutCheckoutline";

@Index(
  "warehouse_reservation_checkout_line_token_id_1b6b9353",
  ["checkoutLineId"],
  {}
)
@Index("warehouse_reservation_pkey", ["id"], { unique: true })
@Index("warehouse_reservation_stock_id_5d178c00", ["stockId"], {})
@Entity("warehouse_reservation", { schema: "public" })
export class WarehouseReservation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "quantity_reserved" })
  quantityReserved: number;

  @Column("timestamp with time zone", { name: "reserved_until" })
  reservedUntil: Date;

  @Column("integer", { name: "stock_id" })
  stockId: number;

  @Column("uuid", { name: "checkout_line_id" })
  checkoutLineId: string;

  @ManyToOne(
    () => WarehouseStock,
    (warehouseStock) => warehouseStock.warehouseReservations
  )
  @JoinColumn([{ name: "stock_id", referencedColumnName: "id" }])
  stock: WarehouseStock;

  @ManyToOne(
    () => CheckoutCheckoutline,
    (checkoutCheckoutline) => checkoutCheckoutline.warehouseReservations
  )
  @JoinColumn([{ name: "checkout_line_id", referencedColumnName: "id" }])
  checkoutLine: CheckoutCheckoutline;
}
