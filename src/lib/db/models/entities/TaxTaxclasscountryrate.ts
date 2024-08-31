import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TaxTaxclass } from "./TaxTaxclass";

@Index("unique_country_without_tax_class", ["country"], { unique: true })
@Index("unique_country_tax_class", ["country", "taxClassId"], { unique: true })
@Index("tax_taxclasscountryrate_pkey", ["id"], { unique: true })
@Index("tax_taxclasscountryrate_tax_class_id_6ce938aa", ["taxClassId"], {})
@Entity("tax_taxclasscountryrate", { schema: "public" })
export class TaxTaxclasscountryrate {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "country", unique: true, length: 2 })
  country: string;

  @Column("numeric", { name: "rate", precision: 12, scale: 3 })
  rate: string;

  @Column("integer", { name: "tax_class_id", nullable: true, unique: true })
  taxClassId: number | null;

  @ManyToOne(
    () => TaxTaxclass,
    (taxTaxclass) => taxTaxclass.taxTaxclasscountryrates
  )
  @JoinColumn([{ name: "tax_class_id", referencedColumnName: "id" }])
  taxClass: TaxTaxclass;
}
