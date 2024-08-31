import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChannelChannel } from "./ChannelChannel";
import { TaxTaxconfigurationpercountry } from "./TaxTaxconfigurationpercountry";

@Index("tax_taxconfiguration_channel_id_key", ["channelId"], { unique: true })
@Index("tax_taxconfiguration_pkey", ["id"], { unique: true })
@Entity("tax_taxconfiguration", { schema: "public" })
export class TaxTaxconfiguration {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

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

  @Column("boolean", { name: "prices_entered_with_tax" })
  pricesEnteredWithTax: boolean;

  @Column("integer", { name: "channel_id", unique: true })
  channelId: number;

  @Column("character varying", {
    name: "tax_app_id",
    nullable: true,
    length: 256,
  })
  taxAppId: string | null;

  @OneToOne(
    () => ChannelChannel,
    (channelChannel) => channelChannel.taxTaxconfiguration
  )
  @JoinColumn([{ name: "channel_id", referencedColumnName: "id" }])
  channel: ChannelChannel;

  @OneToMany(
    () => TaxTaxconfigurationpercountry,
    (taxTaxconfigurationpercountry) =>
      taxTaxconfigurationpercountry.taxConfiguration
  )
  taxTaxconfigurationpercountries: TaxTaxconfigurationpercountry[];
}
