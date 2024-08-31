import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderOrder } from "./OrderOrder";
import { OrderOrderline } from "./OrderOrderline";
import { ProductProduct } from "./ProductProduct";
import { ProductProducttype } from "./ProductProducttype";
import { ShippingShippingmethod } from "./ShippingShippingmethod";
import { TaxTaxclasscountryrate } from "./TaxTaxclasscountryrate";

@Index("tax_taxclass_pkey", ["id"], { unique: true })
@Entity("tax_taxclass", { schema: "public" })
export class TaxTaxclass {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @OneToMany(() => OrderOrder, (orderOrder) => orderOrder.shippingTaxClass)
  orderOrders: OrderOrder[];

  @OneToMany(() => OrderOrderline, (orderOrderline) => orderOrderline.taxClass)
  orderOrderlines: OrderOrderline[];

  @OneToMany(() => ProductProduct, (productProduct) => productProduct.taxClass)
  productProducts: ProductProduct[];

  @OneToMany(
    () => ProductProducttype,
    (productProducttype) => productProducttype.taxClass
  )
  productProducttypes: ProductProducttype[];

  @OneToMany(
    () => ShippingShippingmethod,
    (shippingShippingmethod) => shippingShippingmethod.taxClass
  )
  shippingShippingmethods: ShippingShippingmethod[];

  @OneToMany(
    () => TaxTaxclasscountryrate,
    (taxTaxclasscountryrate) => taxTaxclasscountryrate.taxClass
  )
  taxTaxclasscountryrates: TaxTaxclasscountryrate[];
}
