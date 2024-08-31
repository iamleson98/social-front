import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderFulfillmentline } from "./OrderFulfillmentline";
import { WarehouseAllocation } from "./WarehouseAllocation";
import { WarehouseReservation } from "./WarehouseReservation";
import { ProductProductvariant } from "./ProductProductvariant";
import { WarehouseWarehouse } from "./WarehouseWarehouse";

@Index("warehouse_stock_pkey", ["id"], { unique: true })
@Index(
  "warehouse_stock_warehouse_id_product_variant_id_b04a0a40_uniq",
  ["productVariantId", "warehouseId"],
  { unique: true }
)
@Index("warehouse_stock_product_variant_id_bea58a82", ["productVariantId"], {})
@Index("warehouse_stock_warehouse_id_cc9d4e5d", ["warehouseId"], {})
@Entity("warehouse_stock", { schema: "public" })
export class WarehouseStock {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "quantity" })
  quantity: number;

  @Column("integer", { name: "product_variant_id", unique: true })
  productVariantId: number;

  @Column("uuid", { name: "warehouse_id", unique: true })
  warehouseId: string;

  @Column("integer", { name: "quantity_allocated" })
  quantityAllocated: number;

  @OneToMany(
    () => OrderFulfillmentline,
    (orderFulfillmentline) => orderFulfillmentline.stock
  )
  orderFulfillmentlines: OrderFulfillmentline[];

  @OneToMany(
    () => WarehouseAllocation,
    (warehouseAllocation) => warehouseAllocation.stock
  )
  warehouseAllocations: WarehouseAllocation[];

  @OneToMany(
    () => WarehouseReservation,
    (warehouseReservation) => warehouseReservation.stock
  )
  warehouseReservations: WarehouseReservation[];

  @ManyToOne(
    () => ProductProductvariant,
    (productProductvariant) => productProductvariant.warehouseStocks
  )
  @JoinColumn([{ name: "product_variant_id", referencedColumnName: "id" }])
  productVariant: ProductProductvariant;

  @ManyToOne(
    () => WarehouseWarehouse,
    (warehouseWarehouse) => warehouseWarehouse.warehouseStocks
  )
  @JoinColumn([{ name: "warehouse_id", referencedColumnName: "id" }])
  warehouse: WarehouseWarehouse;
}
