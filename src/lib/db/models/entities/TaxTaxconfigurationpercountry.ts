import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TaxTaxconfiguration } from "./TaxTaxconfiguration";

@Index(
  "tax_taxconfigurationperc_tax_configuration_id_cou_6c2371f7_uniq",
  ["country", "taxConfigurationId"],
  { unique: true }
)
@Index("tax_taxconfigurationpercountry_pkey", ["id"], { unique: true })
@Index(
  "tax_taxconfigurationpercountry_tax_configuration_id_63347e1b",
  ["taxConfigurationId"],
  {}
)
@Entity("tax_taxconfigurationpercountry", { schema: "public" })
export class TaxTaxconfigurationpercountry {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "country", unique: true, length: 2 })
  country: string;

  @Column("boolean", { name: "charge_taxes" })
  chargeTaxes: boolean;

  @Column("character varying", {
    name: "tax_calculation_strategy",
    nullable: true,
    length: 20,
  })
  taxCalculationStrategy: string | null;

  @Column("boolean", { name: "display_gross_prices" })
  displayGrossPrices: boolean;

  @Column("integer", { name: "tax_configuration_id", unique: true })
  taxConfigurationId: number;

  @Column("character varying", {
    name: "tax_app_id",
    nullable: true,
    length: 256,
  })
  taxAppId: string | null;

  @ManyToOne(
    () => TaxTaxconfiguration,
    (taxTaxconfiguration) => taxTaxconfiguration.taxTaxconfigurationpercountries
  )
  @JoinColumn([{ name: "tax_configuration_id", referencedColumnName: "id" }])
  taxConfiguration: TaxTaxconfiguration;
}
