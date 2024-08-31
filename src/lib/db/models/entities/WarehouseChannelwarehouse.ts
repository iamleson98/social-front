import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChannel } from "./ChannelChannel";
import { WarehouseWarehouse } from "./WarehouseWarehouse";

@Index("warehouse_warehouse_channels_channel_id_586b1124", ["channelId"], {})
@Index(
  "warehouse_warehouse_chan_warehouse_id_channel_id_61b3a7c8_uniq",
  ["channelId", "warehouseId"],
  { unique: true }
)
@Index(
  "warehouse_channelwarehou_channel_id_warehouse_id_a78ef311_uniq",
  ["channelId", "warehouseId"],
  { unique: true }
)
@Index("warehouse_warehouse_channels_pkey", ["id"], { unique: true })
@Index("warehouse_channelwarehouse_sort_order_c572ec34", ["sortOrder"], {})
@Index(
  "warehouse_warehouse_channels_warehouse_id_d1b0e96d",
  ["warehouseId"],
  {}
)
@Entity("warehouse_channelwarehouse", { schema: "public" })
export class WarehouseChannelwarehouse {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "warehouse_id" })
  warehouseId: string;

  @Column("integer", { name: "channel_id" })
  channelId: number;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @ManyToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.warehouseChannelwarehouses
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @ManyToOne(
    () => WarehouseWarehouse,
    (warehouseWarehouse) => warehouseWarehouse.warehouseChannelwarehouses
  )
  @JoinColumn([{ name: "warehouse_id", referencedColumnName: "id" }])
  warehouse: WarehouseWarehouse;
}
