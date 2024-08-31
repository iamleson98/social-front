import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ShippingShippingmethod } from "./ShippingShippingmethod";
import { ShippingShippingzoneChannels } from "./ShippingShippingzoneChannels";
import { WarehouseWarehouseShippingZones } from "./WarehouseWarehouseShippingZones";

@Index("s_z_countries_idx", ["countries"], {})
@Index("shipping_shippingzone_pkey", ["id"], { unique: true })
@Index("shippingzone_meta_idx", ["metadata"], {})
@Index("shippingzone_p_meta_idx", ["privateMetadata"], {})
@Entity("shipping_shippingzone", { schema: "public" })
export class ShippingShippingzone {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 100 })
  name: string;

  @Column("character varying", { name: "countries", length: 749 })
  countries: string;

  @Column("boolean", { name: "default" })
  default: boolean;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("text", { name: "description" })
  description: string;

  @OneToMany(
    () => ShippingShippingmethod,
    (shippingShippingmethod) => shippingShippingmethod.shippingZone
  )
  shippingShippingmethods: ShippingShippingmethod[];

  @OneToMany(
    () => ShippingShippingzoneChannels,
    (shippingShippingzoneChannels) => shippingShippingzoneChannels.shippingzone
  )
  shippingShippingzoneChannels: ShippingShippingzoneChannels[];

  @OneToMany(
    () => WarehouseWarehouseShippingZones,
    (warehouseWarehouseShippingZones) =>
      warehouseWarehouseShippingZones.shippingzone
  )
  warehouseWarehouseShippingZones: WarehouseWarehouseShippingZones[];
}
