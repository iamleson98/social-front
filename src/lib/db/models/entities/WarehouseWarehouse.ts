import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { CheckoutCheckout } from "./CheckoutCheckout";
import { OrderOrder } from "./OrderOrder";
import { WarehouseChannelwarehouse } from "./WarehouseChannelwarehouse";
import { WarehouseStock } from "./WarehouseStock";
import { AccountAddress } from "./AccountAddress";
import { WarehouseWarehouseShippingZones } from "./WarehouseWarehouseShippingZones";

@Index("warehouse_warehouse_address_id_d46e1096", ["addressId"], {})
@Index("warehouse_warehouse_external_reference_key", ["externalReference"], {
  unique: true,
})
@Index(
  "warehouse_warehouse_external_reference_9b228bae_like",
  ["externalReference"],
  {}
)
@Index("warehouse_warehouse_pkey", ["id"], { unique: true })
@Index("warehouse_meta_idx", ["metadata"], {})
@Index("warehouse_p_meta_idx", ["privateMetadata"], {})
@Index("warehouse_warehouse_slug_5ca9c575_like", ["slug"], {})
@Index("warehouse_warehouse_slug_key", ["slug"], { unique: true })
@Entity("warehouse_warehouse", { schema: "public" })
export class WarehouseWarehouse {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "name", length: 250 })
  name: string;

  @Column("character varying", { name: "email", length: 254 })
  email: string;

  @Column("integer", { name: "address_id" })
  addressId: number;

  @Column("character varying", { name: "slug", unique: true, length: 255 })
  slug: string;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("character varying", { name: "click_and_collect_option", length: 30 })
  clickAndCollectOption: string;

  @Column("boolean", { name: "is_private" })
  isPrivate: boolean;

  @Column("character varying", {
    name: "external_reference",
    nullable: true,
    unique: true,
    length: 250,
  })
  externalReference: string | null;

  @OneToMany(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.collectionPoint
  )
  checkoutCheckouts: CheckoutCheckout[];

  @OneToMany(() => OrderOrder, (orderOrder) => orderOrder.collectionPoint)
  orderOrders: OrderOrder[];

  @OneToMany(
    () => WarehouseChannelwarehouse,
    (warehouseChannelwarehouse) => warehouseChannelwarehouse.warehouse
  )
  warehouseChannelwarehouses: WarehouseChannelwarehouse[];

  @OneToMany(() => WarehouseStock, (warehouseStock) => warehouseStock.warehouse)
  warehouseStocks: WarehouseStock[];

  @ManyToOne(
    () => AccountAddress,
    (accountAddress) => accountAddress.warehouseWarehouses
  )
  @JoinColumn([{ name: "address_id", referencedColumnName: "id" }])
  address: AccountAddress;

  @OneToMany(
    () => WarehouseWarehouseShippingZones,
    (warehouseWarehouseShippingZones) =>
      warehouseWarehouseShippingZones.warehouse
  )
  warehouseWarehouseShippingZones: WarehouseWarehouseShippingZones[];
}
