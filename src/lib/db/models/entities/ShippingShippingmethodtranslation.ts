import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ShippingShippingmethod } from "./ShippingShippingmethod";

@Index("shipping_shippingmethodtranslation_pkey", ["id"], { unique: true })
@Index(
  "shipping_shippingmethodt_language_code_shipping_m_70e4f786_uniq",
  ["languageCode", "shippingMethodId"],
  { unique: true }
)
@Index(
  "shipping_shippingmethodtranslation_shipping_method_id_31d925d2",
  ["shippingMethodId"],
  {}
)
@Entity("shipping_shippingmethodtranslation", { schema: "public" })
export class ShippingShippingmethodtranslation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "language_code",
    unique: true,
    length: 35,
  })
  languageCode: string;

  @Column("character varying", { name: "name", nullable: true, length: 255 })
  name: string | null;

  @Column("integer", { name: "shipping_method_id", unique: true })
  shippingMethodId: number;

  @Column("jsonb", { name: "description", nullable: true })
  description: object | null;

  @ManyToOne(
    () => ShippingShippingmethod,
    (shippingShippingmethod) =>
      shippingShippingmethod.shippingShippingmethodtranslations
  )
  @JoinColumn([{ name: "shipping_method_id", referencedColumnName: "id" }])
  shippingMethod: ShippingShippingmethod;
}
