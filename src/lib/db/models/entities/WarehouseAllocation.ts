import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { WarehouseStock } from "./WarehouseStock";
import { OrderOrderline } from "./OrderOrderline";

@Index("warehouse_allocation_pkey", ["id"], { unique: true })
@Index("warehouse_allocation_order_line_token_id_a42364d3", ["orderLineId"], {})
@Index("warehouse_allocation_stock_id_73541542", ["stockId"], {})
@Entity("warehouse_allocation", { schema: "public" })
export class WarehouseAllocation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "quantity_allocated" })
  quantityAllocated: number;

  @Column("integer", { name: "stock_id" })
  stockId: number;

  @Column("uuid", { name: "order_line_id" })
  orderLineId: string;

  @ManyToOne(
    () => WarehouseStock,
    (warehouseStock) => warehouseStock.warehouseAllocations
  )
  @JoinColumn([{ name: "stock_id", referencedColumnName: "id" }])
  stock: WarehouseStock;

  @ManyToOne(
    () => OrderOrderline,
    (orderOrderline) => orderOrderline.warehouseAllocations
  )
  @JoinColumn([{ name: "order_line_id", referencedColumnName: "id" }])
  orderLine: OrderOrderline;
}
