import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ShippingShippingmethod } from "./ShippingShippingmethod";

@Index(
  "shipping_shippingmethodz_shipping_method_id_start_33dae54c_uniq",
  ["end", "shippingMethodId", "start"],
  { unique: true }
)
@Index("shipping_shippingmethodzipcoderule_pkey", ["id"], { unique: true })
@Index(
  "shipping_shippingmethodzipcoderule_shipping_method_id_825fd462",
  ["shippingMethodId"],
  {}
)
@Entity("shipping_shippingmethodpostalcoderule", { schema: "public" })
export class ShippingShippingmethodpostalcoderule {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "start", unique: true, length: 32 })
  start: string;

  @Column("character varying", {
    name: "end",
    nullable: true,
    unique: true,
    length: 32,
  })
  end: string | null;

  @Column("integer", { name: "shipping_method_id", unique: true })
  shippingMethodId: number;

  @Column("character varying", { name: "inclusion_type", length: 32 })
  inclusionType: string;

  @ManyToOne(
    () => ShippingShippingmethod,
    (shippingShippingmethod) =>
      shippingShippingmethod.shippingShippingmethodpostalcoderules
  )
  @JoinColumn([{ name: "shipping_method_id", referencedColumnName: "id" }])
  shippingMethod: ShippingShippingmethod;
}
