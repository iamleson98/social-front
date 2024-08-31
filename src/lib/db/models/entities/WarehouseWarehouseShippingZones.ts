import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ShippingShippingzone } from "./ShippingShippingzone";
import { WarehouseWarehouse } from "./WarehouseWarehouse";

@Index("warehouse_warehouse_shipping_zones_pkey", ["id"], { unique: true })
@Index(
  "warehouse_warehouse_ship_warehouse_id_shippingzon_e18400fa_uniq",
  ["shippingzoneId", "warehouseId"],
  { unique: true }
)
@Index(
  "warehouse_warehouse_shipping_zones_shippingzone_id_aeee255b",
  ["shippingzoneId"],
  {}
)
@Index(
  "warehouse_warehouse_shipping_zones_warehouse_id_fccd6647",
  ["warehouseId"],
  {}
)
@Entity("warehouse_warehouse_shipping_zones", { schema: "public" })
export class WarehouseWarehouseShippingZones {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "warehouse_id", unique: true })
  warehouseId: string;

  @Column("integer", { name: "shippingzone_id", unique: true })
  shippingzoneId: number;

  @ManyToOne(
    () => ShippingShippingzone,
    (shippingShippingzone) =>
      shippingShippingzone.warehouseWarehouseShippingZones
  )
  @JoinColumn([{ name: "shippingzone_id", referencedColumnName: "id" }])
  shippingzone: ShippingShippingzone;

  @ManyToOne(
    () => WarehouseWarehouse,
    (warehouseWarehouse) => warehouseWarehouse.warehouseWarehouseShippingZones
  )
  @JoinColumn([{ name: "warehouse_id", referencedColumnName: "id" }])
  warehouse: WarehouseWarehouse;
}
